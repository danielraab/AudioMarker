import { createTRPCRouter } from "~/server/api/trpc";
import { userManagementRouter } from "./userManagement";
import { systemSettingsRouter } from "./systemSettings";
import { softDeletedContentRouter } from "./softDeletedContent";

export const adminRouter = createTRPCRouter({
  // User management operations
  getAllUsers: userManagementRouter.getAllUsers,
  createUser: userManagementRouter.createUser,
  updateUser: userManagementRouter.updateUser,
  deleteUser: userManagementRouter.deleteUser,

  // System settings
  getRegistrationStatus: systemSettingsRouter.getRegistrationStatus,

  // Soft-deleted content management
  getSoftDeletedAudios: softDeletedContentRouter.getSoftDeletedAudios,
  getSoftDeletedPlaylists: softDeletedContentRouter.getSoftDeletedPlaylists,
  recoverAudio: softDeletedContentRouter.recoverAudio,
  recoverPlaylist: softDeletedContentRouter.recoverPlaylist,
  permanentlyDeleteAudio: softDeletedContentRouter.permanentlyDeleteAudio,
  permanentlyDeletePlaylist: softDeletedContentRouter.permanentlyDeletePlaylist,
});