"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { User, Shield, FileAudio, ListMusic } from "lucide-react";
import { api } from "~/trpc/react";

export default function UserListSection() {
  const { data: users, isLoading, error } = api.admin.getAllUsers.useQuery();

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
    <Card>
      <CardHeader className="flex gap-3">
        <User className="h-5 w-5" />
        <div className="flex flex-col">
          <p className="text-lg font-semibold">Registered Users</p>
          <p className="text-small text-default-500">
            Total users: {users?.length ?? 0}
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <Table aria-label="Users table" className="min-h-[400px]">
          <TableHeader>
            <TableColumn>USER</TableColumn>
            <TableColumn>EMAIL</TableColumn>
            <TableColumn>ROLE</TableColumn>
            <TableColumn>VERIFIED</TableColumn>
            <TableColumn>AUDIOS</TableColumn>
            <TableColumn>PLAYLISTS</TableColumn>
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
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}