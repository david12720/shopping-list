/**
 * AI Cost Monitor Script
 * Fetches AI usage logs from Firebase and summarizes costs.
 * 
 * Usage: 
 * 1. Ensure you are logged in: firebase login
 * 2. Run: node get_ai_costs.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load project ID from .firebaserc
const firebaserc = JSON.parse(readFileSync('./.firebaserc', 'utf8'));
const projectId = firebaserc.projects.default;

admin.initializeApp({
  databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
  projectId: projectId
});

const db = admin.database();

async function fetchCosts() {
  console.log(`--- AI Cost Report for project: ${projectId} ---`);
  
  try {
    const snapshot = await db.ref("/admin/ai_costs").once("value");
    const data = snapshot.val();

    if (!data) {
      console.log("No cost logs found.");
      process.exit(0);
    }

    const logs = Object.values(data);
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    const userStats = {};

    logs.forEach(log => {
      totalInputTokens += log.inputTokens || 0;
      totalOutputTokens += log.outputTokens || 0;
      totalCost += log.cost || 0;

      const uid = log.uid || 'unknown';
      if (!userStats[uid]) {
        userStats[uid] = { count: 0, cost: 0 };
      }
      userStats[uid].count++;
      userStats[uid].cost += log.cost || 0;
    });

    console.log(`Total Requests: ${logs.length}`);
    console.log(`Total Input Tokens: ${totalInputTokens.toLocaleString()}`);
    console.log(`Total Output Tokens: ${totalOutputTokens.toLocaleString()}`);
    console.log(`Total Cost: $${totalCost.toFixed(4)}`);
    
    console.log("\n--- Breakdown by User ---");
    Object.entries(userStats).forEach(([uid, stats]) => {
      console.log(`User ${uid}: ${stats.count} requests, $${stats.cost.toFixed(4)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error fetching costs:", error);
    process.exit(1);
  }
}

fetchCosts();
