# Publish and schedule reels, photo posts and stories

Goal: a reel, photo post or story goes online now or at a set time, optionally with its comment automation attached.

## Check first

`status` shows `publishing.enabled` and `publishing.permission`. If publishing is not enabled on the server, say so and stop. If the permission is `missing` or `unknown`, the user reconnects the Instagram account once at https://agentchat.georgkinzel.de/app/connections (Reconnect) and allows publishing.

`get_publishing_limit` shows how many posts Instagram still allows in the next 24 hours.

Several accounts in `status`: settle which account the reel goes to (ask if the request does not say) and pass `account` on `upload_video`, `schedule_reel` and the automation. A reel posted to the wrong account cannot be moved.

## Steps

1. Video source:
   - Local file: `upload_video` returns a one time `upload_url` (1 hour, MP4 or MOV). Upload with `curl -T reel.mp4 -H "Content-Type: video/mp4" "<upload_url>"`. Use the returned `video_id`. One upload per account at a time: wait until the upload finished before starting the next one.
   - Public URL: pass `video_url` directly.
2. Agree on caption, time (`now` or ISO with time zone, for example `2026-10-20T18:00:00+02:00`), cover and whether it is a trial reel.
3. Optional automation: same fields as in [new-reel.md](new-reel.md), it attaches to exactly this reel once it is live.
4. Show a summary and ask for an explicit OK. Then `schedule_reel`.
5. `list_scheduled` shows the status. Publishing happens at most 2 minutes after the set time. Uploaded files are deleted after publishing, cancelling or failing.

## Format: reel, post or story

`schedule_reel` takes `format`:
- `reel` (default): the video as a reel.
- `post`: with `image_url` (public JPEG) a photo post. With a video Instagram only publishes reels, so it becomes a reel that also shows in the feed.
- `story`: video or `image_url`, gone after 24 hours. No caption, no cover, no stickers (link, poll) through the API, and no automation attaches to it. Story replies are handled by an automation with the story reply trigger.

## Several platforms at once

`create_post` plans one video for Instagram, YouTube, TikTok and/or a Facebook page in one call. `list_connections` shows what is connected and `available`; missing channels the user connects with `connect_platform` (the user opens the link in the browser where they are logged in to AgentChat, and logs in when asked). Each platform has its own object, for example `facebook: { format: "reel" | "post" | "story", description, title }`. Facebook reels must be 3 to 90 seconds, Facebook stories at most 60 seconds. AgentChat uploads to TikTok and Facebook exactly at `publish_at`. With `video_url` for YouTube, TikTok or Facebook an account can have at most 5 open posts that are not uploaded yet; for more, upload the file with `upload_video` and pass `video_id`. Ask for an explicit OK before `create_post`, like before `schedule_reel`.

Facebook pages also work as accounts for comment to DM automations (Messenger). On a page there is no follower check, no story replies and no publishing from the page account; pass `account` of an Instagram account for those.

## Reel scheduled somewhere else (Blotato, Instagram, Meta Business Suite)

AgentChat cannot see the other tool's schedule or its post ID. Create the automation in the same step as scheduling: `create_automation` with `next_post: true`, `reel_caption` (first words of the caption) and `reel_publish_at` (the planned time). Both together are the safest. If AgentChat is not reachable, do not schedule the reel; say so instead.

## Cancel

`cancel_scheduled` with the id, after the user's OK. An attached automation stays paused; delete it with `delete_automation` if it is not needed.
