---
title: "Git Worktrees"
description: "Lesser-known but incredible Git feature"
date: 2025-10-04
---

I'm using Git every day. I'm using it so much, that I can type some commands without
even thinking. For example `git status`, `git pull`, `git add`. But there was always
one limitation that I quite disliked: only one branch checked out at a time.

It became even more apparent when there's a new release on the horizon, when
it's sometimes required to make the same change on the `develop` and `release-x.x.x`
branches at the same time.

When the staging area is empty, it's not a problem, but when there are some changes
on a branch that I don't want to commit, switching between branches becomes problematic.

And at first, I was utilizing `git stash` to save my uncomitted work before switching
to another branch. Actually, I've already used it before, when doing `git rebase`,
because Git can't continue rebasing when there are some files in a "dirty state".

But managing multiple stashes in a repository became too cumbersome, and I can't
tell you how many times I just straight up lost my work because I just overwrote
a stash.

## Worktree

I happen to stumble upon this [article](https://mskadu.medium.com/mastering-git-worktree-a-developers-guide-to-multiple-working-directories-c30f834f79a5),
and, without a joke, Git worktrees straight up changed my life!

Let me briefly walk you through what worktree is and how I'm utilizing them.

When you clone a repository to your local machine, turns out you already have a working
tree! This working tree is called "main". And Git allows to create multiple working
trees linked to the same repository, which, in turn, allows for multiple branches
checked out at the same time.

The command to create an additional worktree is simple:

```bash
git worktree add <path> <branch>
```

For example, I have multiple releases checked out on my local filesystem:

```bash
git worktree add ../project-release-x.x.x release-x.x.x
```

And by doing it this way, I'm able to quickly open release that I need in my editor
or IDE and apply some fixes, or just look around. It's really useful to
have a copy of the source code for a particular release, especially when I'm working
on the legacy code.

Worktrees are not limited to the release branches for me, though. Sometimes, albeit
rarely, I can also create a worktree for a couple of different features/fixes that
I work on in parallel. For example:

```bash
git worktree add ../project-awesome-feature feature/project-awesome-feature
```

To not lose track of all of the different worktrees that I have, there's a command
available to list all of them:

```bash
git worktree list
```

And it looks something like this:

```txt
/path/to/the/project                06e50f4bd [feature/awesome-new-feature]
/path/to/the/project-release-7.3.0  3a295b9dd (detached HEAD)
/path/to/the/project-release-7.5.5  859984b85 [release-7.5.5]
/path/to/the/project-release-8.4.0  2afbe785a [fix/some-release-hotfix]
```

As you can see, each and every worktree has some different state, while on the main
worktree I continue to work on new features/fixes.

Deleting a worktree is really simple:

```bash
git worktree remove <name>
```

Where `<name>` is the name of the folder where worktree was placed to. Usually I
do that after the release, or when I stop working on the support ticket that requires
me to take a look into the legacy system at some older release.

Sometimes though, when I have some uncommitted files in the additional worktree,
it is required to use `--force` flag when removing it. Also, the main worktree cannot
be removed.

There are additional commands available, for example `lock`, `move`, `repair`, and
`unlock`. But in my day-to-day work, I've never needed them. You can read about them
in the [documentation](https://git-scm.com/docs/git-worktree).

## Conclusion

Since I discovered worktrees, I can’t imagine going back.

They make it effortless to juggle multiple branches, fix hot issues without stashing,
and keep different releases side by side.

If you ever find yourself fighting with stashes or switching branches too often,
give `git worktree` a try. It might just change your workflow as much as it did mine.
