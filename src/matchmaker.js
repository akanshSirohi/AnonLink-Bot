export class Matchmaker {
    constructor(state, env) {
      this.state = state;
      this.env = env;
    }

    /**
     * Handle matchmaking requests from the Worker.
     *
     * The body of the request must contain a `type` field which controls the
     * action performed:
     *  - `search`         – place the user into the search pool and attempt to
     *                        match with an available partner.
     *  - `stop_search`    – remove the user from the search pool.
     *  - `stop_dialog`    – end an existing match for the user.
     *  - `get_partner`    – retrieve the chat partner id for the user if
     *                        currently matched.
     *
     * Any unrecognised `type` value results in a 400 response.
     */
    async fetch(request) {
      const req = await request.json();
      const { type, chatId } = req;
  
      const users = await this.state.storage.get("searching") || [];
      const matches = await this.state.storage.get("matched") || [];
  
      if (type === "search") {
        if (matches.find(m => m.user1 === chatId || m.user2 === chatId)) {
          return new Response(JSON.stringify({ status: "already_matched" }));
        }
  
        const partner = users.find(id => id !== chatId);
  
        if (partner) {
          const updatedUsers = users.filter(id => id !== chatId && id !== partner);
          const updatedMatches = [...matches, { user1: chatId, user2: partner }];
  
          await this.state.storage.put("searching", updatedUsers);
          await this.state.storage.put("matched", updatedMatches);
  
          return new Response(JSON.stringify({ status: "matched", partner }));
        } else {
          await this.state.storage.put("searching", [...users, chatId]);
          return new Response(JSON.stringify({ status: "waiting" }));
        }
      }
  
      if (type === "stop_search") {
        await this.state.storage.put("searching", users.filter(id => id !== chatId));
        return new Response(JSON.stringify({ status: "stopped_searching" }));
      }
  
      if (type === "stop_dialog") {
        const updatedMatches = matches.filter(
          m => m.user1 !== chatId && m.user2 !== chatId
        );
        await this.state.storage.put("matched", updatedMatches);
        return new Response(JSON.stringify({ status: "stopped_dialog" }));
      }
  
      if (type === "get_partner") {
        const pair = matches.find(m => m.user1 === chatId || m.user2 === chatId);
        return new Response(JSON.stringify({
          partnerId: pair ? (pair.user1 === chatId ? pair.user2 : pair.user1) : null
        }));
      }
  
      return new Response("Invalid request", { status: 400 });
    }
  }
  