"use client";

import { useState } from "react";
import { Button, Dialog, DialogClose, Field, Input, Textarea } from "@/components/ui";
import { createTeam, inviteToTeam, leaveTeam, respondToInvite, setLookingForTeam } from "@/lib/participation/actions";
import { FormError, useFormAction } from "./use-form-action";

export function CreateTeamForm({ hackathonId }: { hackathonId: string }) {
  const { pending, formRef, onSubmit, fieldError, formError } = useFormAction(createTeam);
  return (
    <form ref={formRef} onSubmit={onSubmit} aria-labelledby="create-team-title" className="flex flex-col gap-6">
      <h2 id="create-team-title" className="type-display-4">
        start a team
      </h2>
      <input type="hidden" name="hackathonId" value={hackathonId} />
      <Field label="team name" error={fieldError("name")} required>
        {({ id, describedBy, invalid }) => <Input id={id} name="name" maxLength={60} required aria-invalid={invalid} aria-describedby={describedBy} />}
      </Field>
      <Field label="what you want to make" hint="optional, 500 characters at most" error={fieldError("description")}>
        {({ id, describedBy, invalid }) => <Textarea id={id} name="description" rows={3} maxLength={500} aria-invalid={invalid} aria-describedby={describedBy} />}
      </Field>
      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant="primary" loading={pending} loadingLabel="creating team">
          create team
        </Button>
        <FormError message={formError} />
      </div>
    </form>
  );
}

export function InviteForm({ teamId, primary }: { teamId: string; primary?: boolean }) {
  const { pending, formRef, onSubmit, fieldError, formError } = useFormAction(inviteToTeam);
  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="teamId" value={teamId} />
      <Field label="invite a builder by username" hint="they must be registered for this hackathon" error={fieldError("username")}>
        {({ id, describedBy, invalid }) => (
          <Input id={id} name="username" autoComplete="off" spellCheck={false} maxLength={41} required aria-invalid={invalid} aria-describedby={describedBy} />
        )}
      </Field>
      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant={primary ? "primary" : "secondary"} loading={pending} loadingLabel="sending invite">
          send invite
        </Button>
        <FormError message={formError} />
      </div>
    </form>
  );
}

/** One-tap invite from the looking-for-teammates board. */
export function InviteFromBoard({ teamId, username, name }: { teamId: string; username: string; name: string }) {
  const { pending, onSubmit, formError, fieldError } = useFormAction(inviteToTeam);
  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-2">
      <input type="hidden" name="teamId" value={teamId} />
      <input type="hidden" name="username" value={username} />
      <Button type="submit" variant="ghost" loading={pending} loadingLabel="sending invite">
        invite {name}
      </Button>
      <FormError message={formError ?? fieldError("username")} />
    </form>
  );
}

/** Invite reply. "not now" closes the invite quietly; the team is not told why. */
export function InviteReply({ inviteId, teamName }: { inviteId: string; teamName: string }) {
  const { pending, onSubmit, formError } = useFormAction(respondToInvite);
  const [response, setResponse] = useState<"ACCEPTED" | "DECLINED">("ACCEPTED");
  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-2">
      <input type="hidden" name="inviteId" value={inviteId} />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="response" value="ACCEPTED" variant="secondary" loading={pending && response === "ACCEPTED"} loadingLabel="joining" onClick={() => setResponse("ACCEPTED")}>
          join {teamName}
        </Button>
        <Button type="submit" name="response" value="DECLINED" variant="ghost" loading={pending && response === "DECLINED"} loadingLabel="closing invite" onClick={() => setResponse("DECLINED")}>
          not now
        </Button>
      </div>
      <FormError message={formError} />
    </form>
  );
}

export function LeaveTeamButton({ teamId, teamName, isLast }: { teamId: string; teamName: string; isLast: boolean }) {
  const { pending, onSubmit, formError } = useFormAction(leaveTeam);
  return (
    <Dialog
      title={`leave ${teamName}?`}
      description={isLast ? "you're the last member, so the team closes. your project stays yours." : "your teammates keep the team and its project."}
      trigger={<Button variant="ghost">leave team</Button>}
    >
      <form onSubmit={onSubmit} className="flex flex-col items-start gap-3">
        <input type="hidden" name="teamId" value={teamId} />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="destructive" loading={pending} loadingLabel="leaving team">
            leave {teamName}
          </Button>
          <DialogClose asChild>
            <Button variant="secondary">stay on the team</Button>
          </DialogClose>
        </div>
        <FormError message={formError} />
      </form>
    </Dialog>
  );
}

export function LookingForTeamForm({ hackathonId, looking, note }: { hackathonId: string; looking: boolean; note: string | null }) {
  const { pending, onSubmit, fieldError, formError } = useFormAction(setLookingForTeam);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="hackathonId" value={hackathonId} />
      <input type="hidden" name="looking" value={looking ? "false" : "true"} />
      {looking ? (
        <p className="type-body-s text-secondary measure">you&apos;re on the looking for teammates board.</p>
      ) : (
        <Field label="a line about what you'd like to make" hint="optional, shown on the board" error={fieldError("note")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} name="note" maxLength={280} defaultValue={note ?? ""} aria-invalid={invalid} aria-describedby={describedBy} />
          )}
        </Field>
      )}
      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant="secondary" loading={pending} loadingLabel="saving">
          {looking ? "take me off the board" : "add me to the board"}
        </Button>
        <FormError message={formError} />
      </div>
    </form>
  );
}
