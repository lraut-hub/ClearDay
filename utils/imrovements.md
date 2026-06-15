# ClearDay Reminder System — Phase 1

## Purpose

Build a simple and reliable reminder system for tasks and planned activities.

The goal is not coaching.

The goal is not behavior change.

The goal is simply:

"Remind users about the things they intentionally planned."

Since ClearDay is a PWA, reminders and nudges can only be delivered as notifications when the user has added ClearDay to their device (Home Screen/App Menu) and granted notification permission.

The reminder system should work both offline and online once ClearDay has been added to the device.

---

# Reminder Types

## Activity Reminder

Purpose:

Remind users before a scheduled activity begins.

Example:

Morning Workout starts in 15 minutes.

Trigger:

Activity start time.

Default:

15 minutes before activity.

User can customize:

* 5 minutes
* 15 minutes
* 30 minutes
* 60 minutes

---

## Reflection Reminder

Purpose:

Prompt users to complete their daily reflection.

Example:

Take a moment to reflect on today.

Trigger:

User-defined reflection time.

Default:

8:00 PM

Only once per day.

---

# Device Requirement

Notifications can only be delivered if:

* ClearDay has been added to the user's device (Home Screen/App Menu)
* Notification permission has been granted

If either requirement is missing:

* Do not schedule notifications
* Inform the user that reminders require ClearDay to be added to their device and notifications enabled

Provide a clear path to:

Settings → Add to Home Screen

and

Settings → Notifications

---

# Offline Functionality

Once ClearDay has been added to the device and notification permissions are granted, reminders should continue working without internet.

Use:

* Local storage
* Local notification scheduling
* Service workers
* PWA notification capabilities

Offline reminders should include:

* Activity Reminder
* Reflection Reminder

Requirements:

When a user creates or edits a task:

1. Save locally
2. Schedule local notification immediately
3. Update notification if activity changes
4. Remove notification if activity is deleted

No internet dependency after scheduling.

---

# Online Functionality

When internet is available:

Sync:

* Tasks
* Plans
* Reminder settings
* Notification status

Online mode does NOT generate additional reminder types.

Online mode only ensures:

* Backup
* Schedule synchronization
* Data consistency

Reminder content remains identical.

---

# Reminder Scheduling Rules

## Activity Reminder

Only schedule if:

* Activity has a start time
* Reminders are enabled
* ClearDay has been added to the device
* Notification permission has been granted

If any requirement is missing:

Do not create reminder.

---

## Reflection Reminder

Only schedule if:

* Reflection reminders enabled
* ClearDay has been added to the device
* Notification permission has been granted

Only one reminder per day.

---

# User Controls

Settings → Reminders

Allow:

### Activity Reminders

On / Off

### Reminder Offset

* 5 minutes before
* 15 minutes before
* 30 minutes before
* 60 minutes before

### Reflection Reminder

On / Off

### Reflection Time

User selectable.

---

# Notification Content

Keep messaging simple.

Avoid:

* Motivation
* Coaching
* Productivity language

Use:

Morning Workout starts in 15 minutes.

Protein Breakfast starts in 15 minutes.

Take a moment to reflect on today.

Nothing more.

---

# Notification Behavior

### Completion

If activity completed before reminder fires:

Cancel reminder.

---

### Rescheduling

If activity time changes:

Delete old notification.

Create new notification.

---

### Deletion

If activity removed:

Delete scheduled notification.

---

# Add to Home Screen Integration

If the user has not added ClearDay to their device:

Show the Add to Home Screen prompt on first login.

Explain that reminders and future nudges require ClearDay to be added to the device and notification permissions enabled.

Users can continue using ClearDay without adding it to their device, but they will not receive reminder notifications.

---

# What Is Not Included

Do not build:

* Intent reminders
* Smart nudges
* Pattern recognition
* Goal drift detection
* Plan health observations
* Adaptive planning
* AI-generated notifications
* Notification fatigue detection
* Journey prioritization

These belong to future phases.

Phase 1 is only:

Task Created
↓
Reminder Scheduled
↓
Reminder Delivered
↓
User Acts

The system should be predictable, reliable, and easy to understand.
