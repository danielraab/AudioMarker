'use client';

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onDiscard,
  onSave
}: UnsavedChangesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Unsaved Changes</ModalHeader>
        <ModalBody>
          You have unsaved changes. Do you want to save them before leaving?
        </ModalBody>
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onDiscard}
          >
            Discard Changes
          </Button>
          <Button 
            color="primary" 
            onPress={onSave}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}