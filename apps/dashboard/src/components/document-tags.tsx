"use client";

import { VaultSelectTags } from "@/components/vault/vault-select-tags";
import { useTRPC } from "@/trpc/client";
import type { RouterOutputs } from "@api/trpc/routers/_app";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Tag = NonNullable<
  RouterOutputs["documents"]["getById"]
>["documentTagAssignments"][number];

interface Props {
  id: string;
  tags?: Tag[];
}

export function DocumentTags({ id, tags }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createDocumentTagAssignmentMutation = useMutation(
    trpc.documentTagAssignments.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.documents.getById.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.documents.get.infiniteQueryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.documentTags.get.queryKey(),
        });
      },
    }),
  );

  const deleteDocumentTagAssignmentMutation = useMutation(
    trpc.documentTagAssignments.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.documents.getById.queryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.documents.get.infiniteQueryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.documentTags.get.queryKey(),
        });
      },
    }),
  );

  if (!tags) return null;

  return (
    <VaultSelectTags
      tags={tags.map((tag) => ({
        value: tag.documentTag.id,
        label: tag.documentTag.name,
        id: tag.documentTag.id,
      }))}
      onSelect={(tag) => {
        if (tag.id) {
          createDocumentTagAssignmentMutation.mutate({
            tagId: tag.id,
            documentId: id,
          });
        }
      }}
      onRemove={(tag) => {
        deleteDocumentTagAssignmentMutation.mutate({
          tagId: tag.id,
          documentId: id,
        });
      }}
    />
  );
}
