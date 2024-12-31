export const assignFoyersToAgents = (foyers) => {
  const agents = ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5'];
  const days = 15;

  // Initialize the assignments object for agents and their days
  const assignments = agents.reduce((acc, agent) => {
    acc[agent] = { days: [], totalFoyers: 0 };
    for (let day = 1; day <= days; day++) {
      acc[agent].days.push({ day, foyers: [], totalFoyers: 0 });
    }
    return acc;
  }, {});

  const chunkSize = Math.ceil(foyers.length / (agents.length * days));

  agents.forEach((agent, agentIndex) => {
    for (let day = 0; day < days; day++) {
      const start = (agentIndex * days + day) * chunkSize;
      const end = start + chunkSize;

      // Slice foyers and add them to the current agent and day
      const foyersChunk = foyers.slice(start, end).map((foyer) => ({
        id: foyer.no_foyer,
        taille_foyer: foyer.taille_foyer,
        adresse: foyer.adresse,
        tel: foyer.tel,
        mobile1: foyer.mobile1,
        mobile2: foyer.mobile2,
        completed: false,
        status: 'pending',
      }));

      assignments[agent].days[day].foyers.push(...foyersChunk);

      // Update total foyers for the day and agent
      assignments[agent].days[day].totalFoyers = foyersChunk.length;
      assignments[agent].totalFoyers += foyersChunk.length;
    }
  });

  return assignments;
};
