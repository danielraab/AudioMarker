"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { api } from "~/trpc/react";
import { Shield } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function UserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    general?: string;
  }>({});

  const utils = api.useUtils();
  const isEditMode = !!user;

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setIsAdmin(user.isAdmin);
      } else {
        setName("");
        setEmail("");
        setIsAdmin(false);
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const createUserMutation = api.admin.createUser.useMutation({
    onSuccess: () => {
      void utils.admin.getAllUsers.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  const updateUserMutation = api.admin.updateUser.useMutation({
    onSuccess: () => {
      void utils.admin.getAllUsers.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditMode && user) {
      updateUserMutation.mutate({
        id: user.id,
        name,
        email,
        isAdmin,
      });
    } else {
      createUserMutation.mutate({
        name,
        email,
        isAdmin,
      });
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            {isEditMode ? "Edit User" : "Add New User"}
          </ModalHeader>
          <ModalBody>
            {errors.general && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
                {errors.general}
              </div>
            )}

            <Input
              label="Name"
              placeholder="Enter user name"
              value={name}
              onValueChange={setName}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              isRequired
              autoFocus
            />

            <Input
              label="Email"
              placeholder="Enter email address"
              type="email"
              value={email}
              onValueChange={setEmail}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              isRequired
            />

            <Switch
              isSelected={isAdmin}
              onValueChange={setIsAdmin}
              classNames={{
                base: "inline-flex flex-row-reverse w-full max-w-full bg-content1 hover:bg-content2 items-center justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-warning",
              }}
            >
              <div className="flex flex-col gap-1">
                <p className="text-medium">Admin Access</p>
                <p className="text-tiny text-default-400">
                  Grant administrative privileges to this user
                </p>
              </div>
              {isAdmin && <Shield className="h-4 w-4 text-warning" />}
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
            >
              {isEditMode ? "Update User" : "Create User"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}