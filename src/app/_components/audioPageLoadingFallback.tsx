'use client'

import { Card, CardBody, Spinner } from "@heroui/react";

export default function AudioPageLoadingFallback() {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardBody className="flex items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading audio player...</p>
        </CardBody>
      </Card>
    );
}