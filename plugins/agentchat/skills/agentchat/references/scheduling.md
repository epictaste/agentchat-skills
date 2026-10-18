# Publish and schedule reels

Goal: a reel goes online now or at a set time, optionally with its comment automation attached.

## Check first

`status` shows `publishing.enabled` and `publishing.permission`. If publishing is not enabled on the server, say so and stop. If the permission is `missing` or `unknown`, the user logs in with Instagram once more at https://agentchat.georgkinzel.de/start and allows publishing.

`get_publishing_limit` shows how many posts Instagram still allows in the next 24 hours.

## Steps

1. Video source:
   - Local file: `upload_video` returns a one time `upload_url` (1 hour, MP4 or MOV). Upload with `curl -T reel.mp4 -H "Content-Type: video/mp4" "<upload_url>"`. Use the returned `video_id`.
   - Public URL: pass `video_url` directly.
2. Agree on caption, time (`now` or ISO with time zone, for example `2026-10-20T18:00:00+02:00`), cover and whether it is a trial reel.
3. Optional automation: same fields as in [new-reel.md](new-reel.md), it attaches to exactly this reel once it is live.
4. Show a summary and ask for an explicit OK. Then `schedule_reel`.
5. `list_scheduled` shows the status. Publishing happens at most 2 minutes after the set time. Uploaded files are deleted after publishing, cancelling or failing.

## Cancel

`cancel_scheduled` with the id, after the user's OK. An attached automation stays paused; delete it with `delete_automation` if it is not needed.
