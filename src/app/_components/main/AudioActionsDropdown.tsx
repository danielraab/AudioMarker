'use client';

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { MoreVertical, Play, Edit, Trash2, Link2, Check } from "lucide-react";
import { useState, useCallback } from "react";

interface AudioActionsDropdownProps {
  audioId: string;
  readonlyToken: string;
  onDeleteClick: () => void;
  isDeleteDisabled?: boolean;
}

export function AudioActionsDropdown({ 
  audioId, 
  readonlyToken, 
  onDeleteClick, 
  isDeleteDisabled = false 
}: AudioActionsDropdownProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = useCallback(async () => {
    const listenUrl = `${window.location.origin}/listen/${readonlyToken}`;
    try {
      await navigator.clipboard.writeText(listenUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [readonlyToken]);

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
      <DropdownMenu aria-label="Audio actions">
        <DropdownItem
          key="play"
          startContent={<Play size={16} />}
          href={`/listen/${readonlyToken}`}
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
          href={`/edit/${audioId}`}
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