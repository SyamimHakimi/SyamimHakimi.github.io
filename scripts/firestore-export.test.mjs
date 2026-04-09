import test from "node:test";
import assert from "node:assert/strict";

import {
  buildExportBundle,
  decodeDocument,
  decodeFirestoreFields,
  decodeFirestoreValue,
  sortDecodedRecords,
} from "./firestore-export-lib.mjs";

test("decodeFirestoreValue decodes nested Firestore REST values", () => {
  const decoded = decodeFirestoreValue({
    mapValue: {
      fields: {
        title: { stringValue: "Portfolio" },
        count: { integerValue: "7" },
        favourite: { booleanValue: true },
        publishedAt: { timestampValue: "2026-04-09T00:00:00Z" },
        tags: {
          arrayValue: {
            values: [{ stringValue: "astro" }, { stringValue: "firebase" }],
          },
        },
      },
    },
  });

  assert.deepEqual(decoded, {
    title: "Portfolio",
    count: 7,
    favourite: true,
    publishedAt: "2026-04-09T00:00:00Z",
    tags: ["astro", "firebase"],
  });
});

test("decodeDocument flattens metadata and decoded fields", () => {
  const decoded = decodeDocument({
    name: "projects/portfolio-9e62d/databases/(default)/documents/profile/ddIhV8IxV5DjciJY7UxW",
    createTime: "2026-04-09T00:00:00Z",
    updateTime: "2026-04-09T00:01:00Z",
    fields: {
      Name: { stringValue: "Syamim" },
      Country: { stringValue: "Malaysia" },
    },
  });

  assert.deepEqual(decoded, {
    id: "ddIhV8IxV5DjciJY7UxW",
    path: "profile/ddIhV8IxV5DjciJY7UxW",
    createTime: "2026-04-09T00:00:00Z",
    updateTime: "2026-04-09T00:01:00Z",
    Name: "Syamim",
    Country: "Malaysia",
  });
});

test("sortDecodedRecords honors explicit field ordering", () => {
  const sorted = sortDecodedRecords(
    [
      { id: "b", sorting: 3 },
      { id: "a", sorting: 1 },
      { id: "c", sorting: 2 },
    ],
    { field: "sorting", direction: "asc" },
  );

  assert.deepEqual(
    sorted.map((item) => item.id),
    ["a", "c", "b"],
  );
});

test("buildExportBundle creates the expected archive file map", () => {
  const bundle = buildExportBundle({
    profile: { id: "profile-1", Name: "Syamim" },
    services: [{ id: "service-1" }],
    experiencePlatforms: [{ id: "platform-1" }],
    experienceProtocols: [{ id: "protocol-1" }],
    experienceFrameworks: [{ id: "framework-1" }],
    experienceLanguages: [{ id: "language-1" }],
    project: { id: "project-1", title: "Portfolio" },
    projectTechstack: [{ id: "stack-1" }],
    boardgames: [{ id: "game-1" }],
    photographyGear: [{ id: "gear-1" }],
    socialMedia: [{ id: "social-1" }],
    photos: [{ id: "photo-1" }],
    statistics: { stats: { id: "stats" } },
  });

  assert.deepEqual(Object.keys(bundle), [
    "profile.json",
    "services.json",
    "portfolio.json",
    "projects.json",
    "boardgames.json",
    "photography-gear.json",
    "social-media.json",
    "photos.json",
    "statistics.json",
  ]);

  assert.deepEqual(bundle["projects.json"], {
    document: { id: "project-1", title: "Portfolio" },
    techstack: [{ id: "stack-1" }],
  });
});

test("decodeFirestoreFields returns an empty object for missing fields", () => {
  assert.deepEqual(decodeFirestoreFields(undefined), {});
});
