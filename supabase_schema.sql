-- Create Goals table
create table goals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null,
  category text not null,
  tasks jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for goals
alter table goals enable row level security;

-- Create policies for goals
create policy "Users can perform all actions on their own goals"
  on goals for all
  using (auth.uid() = user_id);

-- Create Tasks table
create table tasks (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  "goalId" text,
  title text not null,
  description text,
  "dueDate" text not null,
  "dueTime" text,
  "endTime" text,
  status text not null check (status in ('pending', 'completed', 'rescheduled')),
  "reminderTime" text,
  priority text check (priority in ('high', 'medium', 'low')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for tasks
alter table tasks enable row level security;

-- Create policies for tasks
create policy "Users can perform all actions on their own tasks"
  on tasks for all
  using (auth.uid() = user_id);
