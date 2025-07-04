import React from "react";
import TeamPiggyBank from "./components/TeamPiggyBank";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Team Piggy Bank
              </h1>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <TeamPiggyBank />
      </main>
    </div>
  );
}

export default App;
