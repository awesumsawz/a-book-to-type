/**
 * Typed interface for typing session data
 */
export interface TypingSession {
  id: string;
  title: string;
  textContent: string;
  lastPosition: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Typed interface for typing statistics
 */
export interface TypingStats {
  sessionId: string;
  date: string;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  charactersTyped: number;
  errors: number;
}

/**
 * Save a typing session to localStorage
 */
export function saveTypingSession(session: TypingSession): void {
  try {
    // Get existing sessions
    const sessions = getSavedSessions();
    
    // Find if session already exists
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = {
        ...session,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new session
      sessions.push({
        ...session,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    // Save back to localStorage
    localStorage.setItem('typing_sessions', JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save typing session:', error);
  }
}

/**
 * Get all saved typing sessions
 */
export function getSavedSessions(): TypingSession[] {
  try {
    const sessionsJson = localStorage.getItem('typing_sessions');
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  } catch (error) {
    console.error('Failed to get typing sessions:', error);
    return [];
  }
}

/**
 * Get a specific typing session by ID
 */
export function getSessionById(id: string): TypingSession | null {
  try {
    const sessions = getSavedSessions();
    return sessions.find(session => session.id === id) || null;
  } catch (error) {
    console.error('Failed to get typing session:', error);
    return null;
  }
}

/**
 * Delete a typing session by ID
 */
export function deleteSession(id: string): boolean {
  try {
    const sessions = getSavedSessions();
    const filteredSessions = sessions.filter(session => session.id !== id);
    
    if (filteredSessions.length !== sessions.length) {
      localStorage.setItem('typing_sessions', JSON.stringify(filteredSessions));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to delete typing session:', error);
    return false;
  }
}

/**
 * Save typing statistics
 */
export function saveTypingStats(stats: TypingStats): void {
  try {
    // Get existing stats
    const existingStats = getTypingStats();
    
    // Add new stats and limit to last 50 entries
    const updatedStats = [...existingStats, stats].slice(-50);
    
    // Save back to localStorage
    localStorage.setItem('typing_stats', JSON.stringify(updatedStats));
  } catch (error) {
    console.error('Failed to save typing stats:', error);
  }
}

/**
 * Get all typing statistics
 */
export function getTypingStats(): TypingStats[] {
  try {
    const statsJson = localStorage.getItem('typing_stats');
    return statsJson ? JSON.parse(statsJson) : [];
  } catch (error) {
    console.error('Failed to get typing stats:', error);
    return [];
  }
}

/**
 * Get statistics for a specific session
 */
export function getStatsForSession(sessionId: string): TypingStats[] {
  try {
    const allStats = getTypingStats();
    return allStats.filter(stat => stat.sessionId === sessionId);
  } catch (error) {
    console.error('Failed to get session stats:', error);
    return [];
  }
} 