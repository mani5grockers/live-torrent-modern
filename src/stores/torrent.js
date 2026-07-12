import { defineStore } from "pinia";
import { getTorrentInfo } from "../utils/axios";

export const useTorrentStore = defineStore("torrent", {
  state: () => ({
    torrentInfo: null
  }),
  
  getters: {
    filesTree: (state) => {
      if (!state.torrentInfo) return [];
      let id = 0;

      const addFile = (path, file, arr) => {
        const objName = path.shift();
        let obj = arr.find(o => o.name === objName);

        if (!obj) {
          obj = {
            id: id++,
            name: objName,
            type: "folder",
            children: []
          };
          arr.push(obj);
        }

        if (path.length) addFile(path, file, obj.children);
        else obj.children.push({ ...file, id: id++ });

        return arr;
      };

      return state.torrentInfo.files.reduce((arr, file) => {
        let path = file.path.split("/").filter(a => a);
        path.pop();
        return addFile(path, file, arr);
      }, []);
    }
  },
  
  actions: {
    async loadTorrentInfo(torrentId) {
      this.torrentInfo = null;
      try {
        const res = await getTorrentInfo(torrentId);
        this.torrentInfo = res.data;
        return res.data;
      } catch (error) {
        console.error("Failed to load torrent info:", error);
        throw error;
      }
    },
    
    async refreshTorrentInfo() {
      const torrent = this.torrentInfo;
      if (torrent) {
        return this.loadTorrentInfo(torrent.infoHash);
      } else {
        return Promise.reject("no torrent info was loaded");
      }
    }
  }
});