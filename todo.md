# Pub Messages - TODO

## Core Features
- [x] Database schema for messages with text, photo URL, author, timestamp
- [x] tRPC procedures: createMessage, listMessages, deleteMessage (admin only)
- [x] Message creation form with text input and optional photo upload
- [x] Image upload to S3 with file validation
- [x] Message board UI with chronological ordering (newest first)
- [x] Responsive grid layout for message cards
- [x] Real-time message list updates after new post creation
- [x] Message metadata display (author name, posting time)
- [x] Authentication integration with Manus OAuth
- [x] Public access to message board (no login required to view)
- [x] User identification for message authors

## Testing & Deployment
- [x] Unit tests for message procedures
- [ ] Manual testing of upload flow
- [ ] Responsive design testing on mobile/tablet
- [ ] Create checkpoint after completion
