"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { User, Shield, FileAudio, ListMusic, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import UserModal from "./UserModal";
import { useDisclosure } from "@heroui/use-disclosure";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  isAdmin: boolean;
  image: string | null;
  _count: {
    audios: number;
    playlists: number;
    sessions: number;
  };
}

export default function UserListSection() {
  const { data: users, isLoading, error } = api.admin.getAllUsers.useQuery();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const utils = api.useUtils();

  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      void utils.admin.getAllUsers.invalidate();
      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      alert(`Error deleting user: ${error.message}`);
    },
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    onOpen();
  };

  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate({ id: userId });
    }
  };

  const handleModalSuccess = () => {
    setSuccessMessage(selectedUser ? "User updated successfully" : "User created successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner size="lg" label="Loading users..." />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-danger">Error loading users: {error.message}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between gap-3">
          <div className="flex gap-3">
            <User className="h-5 w-5" />
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Registered Users</p>
              <p className="text-small text-default-500">
                Total users: {users?.length ?? 0}
              </p>
            </div>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleAddUser}
          >
            Add User
          </Button>
        </CardHeader>
        <CardBody>
          {successMessage && (
            <div className="mb-4 rounded-lg bg-success-50 p-3 text-sm text-success">
              {successMessage}
            </div>
          )}
          <Table aria-label="Users table" className="min-h-[400px]">
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>VERIFIED</TableColumn>
              <TableColumn>AUDIOS</TableColumn>
              <TableColumn>PLAYLISTS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody items={users ?? []} emptyContent="No users found">
              {(user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={user.image ?? undefined}
                        name={user.name ?? user.email ?? "User"}
                        size="sm"
                        fallback={<User className="h-4 w-4" />}
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold">
                          {user.name ?? "No name"}
                        </p>
                        <p className="text-xs text-default-400">{user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{user.email ?? "No email"}</p>
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Chip
                        startContent={<Shield className="h-3 w-3" />}
                        color="warning"
                        size="sm"
                        variant="flat"
                      >
                        Admin
                      </Chip>
                    ) : (
                      <Chip color="default" size="sm" variant="flat">
                        User
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Chip color="success" size="sm" variant="flat">
                        Verified
                      </Chip>
                    ) : (
                      <Chip color="default" size="sm" variant="flat">
                        Not verified
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileAudio className="h-4 w-4 text-default-400" />
                      <span className="text-sm">{user._count.audios}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ListMusic className="h-4 w-4 text-default-400" />
                      <span className="text-sm">{user._count.playlists}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="User actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Pencil className="h-4 w-4" />}
                          onPress={() => handleEditUser(user)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash2 className="h-4 w-4" />}
                          onPress={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <UserModal
        isOpen={isOpen}
        onClose={onClose}
        user={selectedUser}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}