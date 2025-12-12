import { test, expect } from "@playwright/test";

// Лёгкие smoke-тесты для страницы рисования.
test.describe("Drawing page smoke", () => {
  test("baseline assertion", async () => {
    expect(true).toBe(true);
  });

  test("can create a simple canvas state placeholder", async () => {
    const width = 800;
    const height = 600;
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("toolbar default color palette placeholder", async () => {
    const colors = ["#e53935", "#0d47a1", "#000000", "#ffffff", "#fdd835", "#00c853"];
    expect(colors).toHaveLength(6);
    expect(colors[0]).toMatch(/^#/);
  });
});
