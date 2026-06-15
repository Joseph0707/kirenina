import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../../auth/auth.service';
import { RoomsService } from '../../rooms/rooms.service';
import { PlayersService } from '../../players/players.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../auth/auth.service';
import { ClientToServerEvents, ServerToClientEvents, RoomPlayer, RoomSpectator } from '@kirenina/shared-types';

// Extend the socket to include our player info
interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
  user: {
    id: string;
    deviceId: string;
    username: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*', // En production, restreindre à l'URL du frontend
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server<ClientToServerEvents, ServerToClientEvents>;

  // État en mémoire pour la gestion temps réel des rooms (avant sauvegarde en DB)
  // map roomId -> map playerId -> RoomPlayer
  private roomPlayers = new Map<string, Map<string, RoomPlayer>>();
  private roomSpectators = new Map<string, Map<string, RoomSpectator>>();

  constructor(
    private authService: AuthService,
    private roomsService: RoomsService,
    private playersService: PlayersService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('Token manquant');

      const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
      const payload = jwt.verify(token, secret) as JwtPayload;

      const player = await this.authService.validatePlayer(payload.sub);
      
      client.user = {
        id: player.id,
        deviceId: player.deviceId,
        username: player.username,
      };

      // Mettre le socket dans une "room" personnelle pour pouvoir lui envoyer des messages privés
      client.join(`user:${player.id}`);
      
      console.log(`🔌 Joueur connecté: ${player.username} (${client.id})`);
    } catch (error) {
      console.log(`❌ Connexion rejetée (${client.id}): ${(error as any).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      console.log(`🔌 Joueur déconnecté: ${client.user.username} (${client.id})`);
      // TODO: Gérer la déconnexion dans les rooms (période de grâce de 1min, puis abandon/auto-play)
      this.handlePlayerDisconnection(client.user.id);
    }
  }

  // ==========================================
  // ROOM LOGIC
  // ==========================================

  @SubscribeMessage('room:join')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const room = await this.roomsService.getRoomById(data.roomId);
      
      // Initialiser les maps si elles n'existent pas
      if (!this.roomPlayers.has(room.id)) {
        this.roomPlayers.set(room.id, new Map());
        this.roomSpectators.set(room.id, new Map());
      }

      const playersInRoom = this.roomPlayers.get(room.id)!;
      const spectatorsInRoom = this.roomSpectators.get(room.id)!;

      // Vérifier si le joueur est déjà dedans
      if (playersInRoom.has(client.user.id)) {
        // Il se reconnecte
        const rp = playersInRoom.get(client.user.id)!;
        rp.isConnected = true;
        client.join(`room:${room.id}`);
        // Notifier les autres
        this.server.to(`room:${room.id}`).emit('game:playerReconnected', { playerId: client.user.id });
        return;
      }

      // Si la room est pleine ou a commencé, on essaye de rejoindre en tant que spectateur
      if (room.status !== 'WAITING' || playersInRoom.size >= room.maxPlayers) {
        if (!(room as any).allowSpectators && (room as any).allowSpectators !== undefined) {
          throw new Error('La room est pleine et les spectateurs ne sont pas autorisés');
        }
        return this.joinAsSpectator(client, room.id);
      }

      // Rejoindre en tant que joueur
      const profile = await this.playersService.getProfile(client.user.id);
      
      const newPlayer: RoomPlayer = {
        playerId: client.user.id,
        username: client.user.username,
        avatarUrl: profile.avatarUrl || undefined,
        isReady: false,
        isConnected: true,
      };

      playersInRoom.set(client.user.id, newPlayer);
      client.join(`room:${room.id}`);

      // Notifier la room
      this.server.to(`room:${room.id}`).emit('room:playerJoined', { player: newPlayer });

      // Notifier le lobby
      if (room.isPublic) {
        const roomItem = {
          id: room.id,
          name: room.name,
          gameType: room.gameType as any,
          maxPlayers: room.maxPlayers,
          currentPlayers: playersInRoom.size,
          status: room.status as any,
          creatorUsername: room.creator.username,
          createdAt: room.createdAt.toISOString(),
        };
        if (playersInRoom.size === 1) {
          this.server.to(`lobby:${room.gameType}`).emit('lobby:roomAdded', { room: roomItem });
        } else {
          this.server.to(`lobby:${room.gameType}`).emit('lobby:roomUpdated', { room: roomItem });
        }
      }

      // Envoyer l'état actuel de la room au nouveau joueur
      // (On envoie un event complet ou on le laisse fetcher via REST, mais c'est mieux en WS)
      client.emit('room:updated', {
        room: {
          ...room,
          gameType: room.gameType as any,
          status: room.status as any,
          creatorUsername: room.creator.username,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
          allowSpectators: true,
          totalRounds: 3,
          players: Array.from(playersInRoom.values()),
          spectators: Array.from(spectatorsInRoom.values()),
        }
      });

    } catch (err: any) {
      client.emit('room:error', { message: err.message, code: 'JOIN_FAILED' });
    }
  }

  @SubscribeMessage('room:ready')
  handleRoomReady(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { roomId: string }) {
    const playersInRoom = this.roomPlayers.get(data.roomId);
    if (!playersInRoom || !playersInRoom.has(client.user.id)) return;

    const player = playersInRoom.get(client.user.id)!;
    player.isReady = true;

    this.server.to(`room:${data.roomId}`).emit('room:playerReady', { playerId: client.user.id, isReady: true });
    
    // TODO: Si tout le monde est prêt et minPlayers atteints, on pourrait déclencher un countdown
  }

  @SubscribeMessage('room:unready')
  handleRoomUnready(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { roomId: string }) {
    const playersInRoom = this.roomPlayers.get(data.roomId);
    if (!playersInRoom || !playersInRoom.has(client.user.id)) return;

    const player = playersInRoom.get(client.user.id)!;
    player.isReady = false;

    this.server.to(`room:${data.roomId}`).emit('room:playerReady', { playerId: client.user.id, isReady: false });
  }

  @SubscribeMessage('chat:message')
  handleChatMessage(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { roomId: string; message: string }) {
    // Vérifier si on est bien dans la room
    const inRoom = this.roomPlayers.get(data.roomId)?.has(client.user.id) || this.roomSpectators.get(data.roomId)?.has(client.user.id);
    if (!inRoom) return;

    this.server.to(`room:${data.roomId}`).emit('chat:message', {
      id: crypto.randomUUID(),
      roomId: data.roomId,
      playerId: client.user.id,
      username: client.user.username,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  }

  // ==========================================
  // LOBBY LOGIC
  // ==========================================

  @SubscribeMessage('lobby:subscribe')
  async handleLobbySubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { gameType: string },
  ) {
    client.join(`lobby:${data.gameType}`);
    
    // Fetch active rooms from database
    const rooms = await this.roomsService.getActiveRooms();
    
    // Supplement each room with active player count from our memory cache
    const enrichedRooms = rooms.map(room => {
      const playersInRoom = this.roomPlayers.get(room.id);
      return {
        ...room,
        currentPlayers: playersInRoom ? playersInRoom.size : 0,
      };
    });

    client.emit('lobby:roomsList', { rooms: enrichedRooms as any });
    console.log(`📡 Joueur ${client.user.username} inscrit au lobby ${data.gameType}`);
  }

  @SubscribeMessage('lobby:unsubscribe')
  handleLobbyUnsubscribe(@ConnectedSocket() client: AuthenticatedSocket) {
    for (const room of client.rooms) {
      if (room.startsWith('lobby:')) {
        client.leave(room);
      }
    }
    console.log(`📡 Joueur ${client.user.username} désinscrit du lobby`);
  }

  // ==========================================
  // UTILS
  // ==========================================

  private joinAsSpectator(client: AuthenticatedSocket, roomId: string) {
    const spectators = this.roomSpectators.get(roomId)!;
    const spec: RoomSpectator = {
      playerId: client.user.id,
      username: client.user.username,
    };
    spectators.set(client.user.id, spec);
    client.join(`room:${roomId}`);
    this.server.to(`room:${roomId}`).emit('room:spectatorJoined', { spectator: spec });
  }

  private handlePlayerDisconnection(playerId: string) {
    // Parcourir toutes les rooms pour marquer le joueur déconnecté
    for (const [roomId, players] of this.roomPlayers.entries()) {
      if (players.has(playerId)) {
        const p = players.get(playerId)!;
        p.isConnected = false;
        
        // Notifier la room de la déconnexion
        // Le frontend ou le Game Engine démarrera le chrono d'une minute
        this.server.to(`room:${roomId}`).emit('game:playerDisconnected', { 
          playerId, 
          graceSeconds: 60 
        });

        // Optionnel : Notifier le lobby
        this.roomsService.getRoomById(roomId).then(room => {
          if (room.isPublic) {
            this.server.to(`lobby:${room.gameType}`).emit('lobby:roomUpdated', {
              room: {
                id: room.id,
                name: room.name,
                gameType: room.gameType as any,
                maxPlayers: room.maxPlayers,
                currentPlayers: players.size,
                status: room.status as any,
                creatorUsername: room.creator.username,
                createdAt: room.createdAt.toISOString(),
              }
            });
          }
        }).catch(err => console.error(err));
      }
    }
  }
}
