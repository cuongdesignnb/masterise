import assert from "node:assert/strict";
import test from "node:test";
import { normalizeContactPageContent, safeExternalUrl } from "../src/lib/contactPage";

const productionLikePayload = {
  hero: {
    title: null,
    image: null,
    primaryCta: { label: null, url: null },
  },
  salesTeam: {
    items: [
      { name: null, phone: null, email: null, zaloUrl: null },
      null,
    ],
  },
  contactForm: {
    hotline: null,
    email: null,
    address: null,
    mapUrl: null,
    mapEmbedUrl: null,
    directionsUrl: null,
  },
  faqs: { items: null },
  cta: { primaryCta: null, secondaryCta: { url: null } },
};

test("deep normalization accepts production nulls and returns a complete contact shape", () => {
  const result = normalizeContactPageContent(productionLikePayload);

  assert.equal(result.hero.title, "");
  assert.equal(result.hero.image, "");
  assert.equal(result.hero.primaryCta.label, "");
  assert.equal(result.hero.primaryCta.url, "");
  assert.deepEqual(result.salesTeam.items, []);
  assert.equal(result.contactForm.directionsUrl, "");
  assert.deepEqual(result.faqs.items, []);
  assert.equal(result.sectionOrder.length, 9);
});

test("malformed sections and arrays fall back without throwing", () => {
  const result = normalizeContactPageContent({
    hero: "invalid",
    introduction: { images: [null, "invalid", { url: null, sortOrder: "20" }] },
    achievements: { enabled: "false", metrics: {} },
    departments: null,
  });

  assert.equal(result.hero.title.length > 0, true);
  assert.deepEqual(result.introduction.images, []);
  assert.deepEqual(result.achievements.metrics, []);
  assert.equal(result.departments.enabled, true);
});

test("safeExternalUrl rejects non-strings and unsafe protocols", () => {
  assert.doesNotThrow(() => safeExternalUrl(null));
  assert.equal(safeExternalUrl(null), undefined);
  assert.equal(safeExternalUrl(undefined), undefined);
  assert.equal(safeExternalUrl({}), undefined);
  assert.equal(safeExternalUrl([]), undefined);
  assert.equal(safeExternalUrl("javascript:alert(1)"), undefined);
  assert.equal(safeExternalUrl("data:text/html,test"), undefined);
  assert.equal(safeExternalUrl("vbscript:msgbox(1)"), undefined);
  assert.equal(safeExternalUrl("/lien-he"), "/lien-he");
  assert.equal(safeExternalUrl("#global-contact-form"), "#global-contact-form");
  assert.equal(safeExternalUrl("https://example.com/path"), "https://example.com/path");
});
