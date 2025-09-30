export interface Playlist {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  audioCount: number;
}

export interface PlaylistForAudio {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  audioCount: number;
  hasAudio: boolean;
}

export interface PlaylistWithAudios {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  audios: PlaylistAudio[];
}

export interface PlaylistAudio {
  id: string;
  order: number;
  addedAt: Date;
  audio: {
    id: string;
    name: string;
    originalFileName: string;
    filePath: string;
    createdAt: Date;
    markerCount: number;
  };
}

export interface AudioForPlaylist {
  id: string;
  name: string;
  originalFileName: string;
  filePath: string;
  createdAt: Date;
  markerCount: number;
}

export interface AudioWithPlaylistInfo {
  id: string;
  name: string;
  originalFileName: string;
  filePath: string;
  createdAt: Date;
  markerCount: number;
  isInPlaylist: boolean;
}