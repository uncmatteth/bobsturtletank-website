interface LeaderboardEntry {
  name: string;
  height: number;
  timestamp: number;
}

export class LeaderboardService {
  private isLocalDev(): boolean {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  }

  public async submitScore(name: string, height: number): Promise<boolean> {
    if (this.isLocalDev()) {
      // In local dev, simulate successful submission
      console.log(`[LOCAL DEV] Simulated score submission: ${name} - ${height} units`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return true;
    }

    try {
      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), height })
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async getTopScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    if (this.isLocalDev()) {
      // In local dev, return sample data for testing
      return [
        { name: "TestPlayer1", height: 250, timestamp: Date.now() - 60000 },
        { name: "TestPlayer2", height: 180, timestamp: Date.now() - 120000 },
        { name: "TestPlayer3", height: 120, timestamp: Date.now() - 180000 }
      ];
    }

    try {
      const res = await fetch(`/api/leaderboard?limit=${limit}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API failed
    }
    
    return [];
  }

  public async isTopScore(height: number): Promise<boolean> {
    try {
      const scores = await this.getTopScores(10);
      return scores.length === 0 || height > scores[scores.length - 1]?.height;
    } catch {
      return true;
    }
  }
}