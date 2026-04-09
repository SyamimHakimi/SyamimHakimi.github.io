<script setup lang="ts">
/**
 * ContactForm — EmailJS-powered contact form.
 * Island: client:load — EmailJS requires browser fetch API on mount.
 * No Firestore composable — purely client-side submission.
 */
import { ref, reactive } from "vue";
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY as string;

const form = reactive({
  from_name: "",
  from_email: "",
  message: "",
});

const status = ref<"idle" | "sending" | "success" | "error">("idle");
const errorMessage = ref("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

async function submit() {
  if (!form.from_name.trim() || !form.from_email.trim() || !form.message.trim()) {
    errorMessage.value = "Please fill in all fields.";
    status.value = "error";
    return;
  }

  if (!EMAIL_RE.test(form.from_email.trim())) {
    errorMessage.value = "Please enter a valid email address.";
    status.value = "error";
    return;
  }

  status.value = "sending";
  errorMessage.value = "";

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...form }, { publicKey: PUBLIC_KEY });
    status.value = "success";
    form.from_name = "";
    form.from_email = "";
    form.message = "";
  } catch (err) {
    status.value = "error";
    errorMessage.value = err instanceof Error ? err.message : "Failed to send message. Please try again.";
  }
}
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="submit">
    <div>
      <label for="contact-name" class="mb-1.5 block text-sm font-medium">Name</label>
      <input
        id="contact-name"
        v-model="form.from_name"
        type="text"
        autocomplete="name"
        placeholder="Your name"
        required
        class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
      />
    </div>

    <div>
      <label for="contact-email" class="mb-1.5 block text-sm font-medium">Email</label>
      <input
        id="contact-email"
        v-model="form.from_email"
        type="email"
        autocomplete="email"
        placeholder="your@email.com"
        required
        class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
      />
    </div>

    <div>
      <label for="contact-message" class="mb-1.5 block text-sm font-medium">Message</label>
      <textarea
        id="contact-message"
        v-model="form.message"
        rows="5"
        placeholder="Tell me about your project…"
        required
        class="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
      />
    </div>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="status === 'sending'"
      class="w-full rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
    >
      <span v-if="status === 'sending'">Sending…</span>
      <span v-else>Send Message</span>
    </button>

    <!-- Success -->
    <p v-if="status === 'success'" class="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400" role="status">
      Message sent! I'll get back to you soon.
    </p>

    <!-- Error -->
    <p v-if="status === 'error'" class="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-400" role="alert">
      {{ errorMessage }}
    </p>
  </form>
</template>
