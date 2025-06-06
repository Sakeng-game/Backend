import mongoose, { Document, Schema, Model } from 'mongoose';
import User from './user';


// Define game status types
type GameStatus = 'pending' | 'active' | 'completed' | 'declined';
type GameType = 'Staked' | 'Friendly';

interface IMove {
    player: mongoose.Types.ObjectId;
    move: string;
    timestamp: Date;
}

interface IGame extends Document {
    initiator: mongoose.Types.ObjectId;
    opponent: mongoose.Types.ObjectId;
    status: GameStatus;
    gameType: GameType; 
    createdAt: Date;
    updatedAt: Date;
    ready: boolean;
    winner?: mongoose.Types.ObjectId;
    currentTurn: mongoose.Types.ObjectId;
    board: {
        pieces: {
          id: string;
          player: 'red' | 'blue';
          position: {
            x: number;
            y: number;
          };
        }[];
      };
          moves: IMove[];
    players: {
        red: mongoose.Schema.Types.ObjectId,
        blue: mongoose.Schema.Types.ObjectId,
    };
    readyPlayers: {
        red: boolean;
        blue: boolean;
    };
    placedPiecesRed: number;
    placedPiecesBlue: number;
    phase: 'placing' | 'moving' | 'removing' | 'gameOver';
    
}

const gameSchema: Schema<IGame> = new Schema(
    {
        initiator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        opponent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'declined'],
            default: 'pending',
        },
        gameType: {
            type: String,
            enum: ['staked', 'friendly'],
            required: true,
        },
        ready: { type: Boolean, default: false },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        currentTurn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        board: {
            pieces: [
              {
                id: String,
                player: { type: String, enum: ['red', 'blue'] },
                position: {
                  x: Number,
                  y: Number
                }
              }
            ]
          },
          
        placedPiecesRed: { type: Number, default: 0 },
        placedPiecesBlue: { type: Number, default: 0 }, 
         phase: { 
        type: String, 
        enum: ['placing', 'moving', 'removing','gameOver'], 
        default: 'placing' 
        }, 
        
    
        moves: [{
            player: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            move: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        players: {
            red: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            blue: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        },
        readyPlayers: {
            red: {
                type: Boolean,
                default: false,
            },
            blue: {
                type: Boolean,
                default: false,
            },
        },
    
    },
    { timestamps: true }
);

// Add index for faster queries
gameSchema.index({ initiator: 1, status: 1 });
gameSchema.index({ opponent: 1, status: 1 });
gameSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed') {
      // Add validation that game is actually complete
      if (!this.winner && !this.isDraw) {
        throw new Error('Cannot complete game without winner/draw');
      }
    }
    next();
  });

const Game: Model<IGame> = mongoose.model<IGame>('Game', gameSchema);
export default Game;