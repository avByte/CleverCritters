import { useState, useEffect, useRef } from "react";
import type { Pet, Task } from "./types";
import { loadState, saveState } from "./utils";

import Home from "./components/Home";
import PetLounge from "./components/PetLounge";
import TimerPanel from "./components/TimerPanel";
import TaskPanel from "./components/TaskPanel";
import QuizPanel from "./components/QuizPanel";

export default function App() {
  const persisted = loadState();
  const [pet, setPet] = useState<Pet | null>(persisted?.pet ?? null);
  const [tasks, setTasks] = useState<Task[]>(persisted?.tasks ?? []);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerRemaining, setTimerRemaining] = useState(25 * 60);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    saveState({ pet, tasks });
  }, [pet, tasks]);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimerRemaining((r) => {
          if (r <= 1) {
            finishTimer();
            return timerMinutes * 60;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [timerRunning, timerMinutes]);

  function finishTimer() {
    if (!pet) return;
    const newSec = pet.studiedSeconds + timerMinutes * 60;
    let newStage = pet.stage;
    if (newSec >= 24 * 3600) newStage = 2;
    else if (newSec >= 3600) newStage = 1;

    setPet({ ...pet, studiedSeconds: newSec, stage: newStage });
    setTimerRunning(false);
  }

  function startTimer(minutes: number) {
    setTimerMinutes(minutes);
    setTimerRemaining(minutes * 60);
    setTimerRunning(true);
  }

  function stopTimer() {
    setTimerRunning(false);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  if (!pet) return <Home onCreate={setPet} />;

  function closePanel() {
    setActivePanel(null);
  }

  function goHome() {
    setPet(null);
    setActivePanel(null);
    setTimerRunning(false);
  }

  return (
    <div className="min-h-screen">
      {/* Persistent Timer Panel */}
      {timerRunning && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center p-4 z-40">
          <div className="bg-gray-900 rounded-xl max-w-md w-full mt-8 shadow-2xl border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Study Session Active</h2>
                <button
                  className="btn-minimal text-sm"
                  onClick={stopTimer}
                >
                  ✕ Close
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-amber-400 mb-4">
                  {formatTime(timerRemaining)}
                </div>
                <div className="text-gray-400 mb-6">Time Remaining</div>
                
                <div className="flex gap-3">
                  <button
                    className="btn-danger flex-1"
                    onClick={stopTimer}
                  >
                    Stop Session
                  </button>
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setActivePanel('timer')}
                  >
                    Open Timer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Lounge */}
      <PetLounge pet={pet} onOpenPanel={setActivePanel} onGoHome={goHome} />
      
      {/* Panels */}
      {activePanel === 'timer' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Study Timer</h2>
              <button 
                className="btn-minimal text-sm"
                onClick={closePanel}
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4">
              <TimerPanel 
                timerRunning={timerRunning}
                timerRemaining={timerRemaining}
                onStartTimer={startTimer}
                onStopTimer={stopTimer}
              />
            </div>
          </div>
        </div>
      )}

      {activePanel === 'tasks' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Tasks & Goals</h2>
              <button 
                className="btn-minimal text-sm"
                onClick={closePanel}
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4">
              <TaskPanel pet={pet} setPet={setPet} tasks={tasks} setTasks={setTasks} />
            </div>
          </div>
        </div>
      )}

      {activePanel === 'quiz' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Study Quiz</h2>
              <button 
                className="btn-minimal text-sm"
                onClick={closePanel}
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4">
              <QuizPanel pet={pet} setPet={setPet} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}