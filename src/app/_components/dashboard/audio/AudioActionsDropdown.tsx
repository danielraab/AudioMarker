'use client';

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { MoreVertical, Play, Edit, Trash2, Link2, Check, ListMusic } from "lucide-react";
import { useState, useCallback } from "react";
import { AddToPlaylistModal } from "./AddToPlaylistModal";

interface AudioActionsDropdownProps {
  audioId: string;
  onDeleteClick: () => void;
  isDeleteDisabled?: boolean;
}

export function AudioActionsDropdown({ 
  audioId,
  onDeleteClick,
  isDeleteDisabled = false 
}: AudioActionsDropdownProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleCopyLink = useCallback(async () => {
    const listenUrl = `${window.location.origin}/audios/${audioId}/listen`;
    try {
      await navigator.clipboard.writeText(listenUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [audioId]);

  return (
    <>
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
      <DropdownMenu aria-label="Audio actions">
        <DropdownItem
          key="play"
          startContent={<Play size={16} />}
          href={`/audios/${audioId}/listen`}
          className="text-success"
          color="success"
        >
          Play
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
          href={`/audios/${audioId}/edit`}
          className="text-primary"
          color="primary"
        >
          Edit
        </DropdownItem>
        <DropdownItem
          key="add-to-playlist"
          startContent={<ListMusic size={16} />}
          onPress={onOpen}
          className="text-secondary"
          color="secondary"
        >
          Add to Playlist
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

    <AddToPlaylistModal
      isOpen={isOpen}
      onClose={onClose}
      audioId={audioId}
    />
    </>
  );
}