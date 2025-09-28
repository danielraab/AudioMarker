'use client';

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { MoreVertical, Edit, Trash2, Play, Check, Link2 } from "lucide-react";
import { useCallback, useState } from "react";

interface PlaylistActionsDropdownProps {
  playlistId: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
  isDeleteDisabled?: boolean;
}

export function PlaylistActionsDropdown({ 
  playlistId, 
  onEditClick,
  onDeleteClick, 
  isDeleteDisabled = false 
}: PlaylistActionsDropdownProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = useCallback(async () => {
    const listenUrl = `${window.location.origin}/playlist/${playlistId}/listen`;
    try {
      await navigator.clipboard.writeText(listenUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [playlistId]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          isIconOnly
          size="sm"
          variant="light"
          aria-label="Actions"
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Playlist actions">
      <DropdownItem
          key="play"
          startContent={<Play size={16} />}
          href={`/playlist/${playlistId}/listen`}
          className="text-success"
          color="success"
        >
          Play TODO
        </DropdownItem>
        <DropdownItem
          key="copy"
          startContent={copySuccess ? <Check size={16} /> : <Link2 size={16} />}
          onPress={handleCopyLink}
          className={copySuccess ? "text-success" : ""}
        >
          {copySuccess ? "Copied!" : "Copy Play Link"}
        </DropdownItem>
        <DropdownItem
          key="edit"
          startContent={<Edit size={16} />}
          onPress={onEditClick}
          className="text-primary"
          color="primary"
        >
          Edit
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash2 size={16} />}
          onPress={onDeleteClick}
          isDisabled={isDeleteDisabled}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}