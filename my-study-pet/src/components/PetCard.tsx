import type { Pet } from "../types";
import { formatSeconds } from "../utils";

const SPRITES = {
  0: "🐣",
  1: "🦊", 
  2: "🐉",
};

const STAGE_NAMES = {
  0: "Hatchling",
  1: "Scholar",
  2: "Master",
};

export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="card">
      <div className="text-center">
        {/* Pet Display */}
        <div className="text-8xl mb-4 animate-float">
          {SPRITES[pet.stage]}
        </div>
        
        {/* Pet Name */}
        <h2 className="text-2xl font-bold text-white mb-2">{pet.name}</h2>
        
        {/* Stage Badge */}
        <div className="inline-block bg-amber-500/20 text-amber-400 px-4 py-1 rounded-full text-sm font-medium mb-4">
          {STAGE_NAMES[pet.stage]} • Stage {pet.stage}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{pet.points}</div>
            <div className="text-sm text-gray-400">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{formatSeconds(pet.studiedSeconds)}</div>
            <div className="text-sm text-gray-400">Studied</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Evolution Progress</span>
            <span>{Math.floor((pet.studiedSeconds / (24 * 3600)) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((pet.studiedSeconds / (24 * 3600)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}