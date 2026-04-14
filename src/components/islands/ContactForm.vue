<script setup lang="ts">
/**
 * ContactForm — EmailJS-powered contact form.
 * Island: client:load — EmailJS requires browser fetch API on mount.
 * No Firestore composable — purely client-side submission.
 *
 * Interaction model (per approved Step 9 mockup):
 * - Blur-only field validation
 * - 500-char counter on message
 * - Inline circular spinner during submission
 * - Snackbar feedback: success auto-dismisses after 4 s; error offers Retry
 * - aria-live regions announce status changes to assistive technology
 */
import { ref, reactive, computed, onUnmounted } from "vue";
import emailjs from "@emailjs/browser";
import { Motion } from "motion-v";
import DetailTileGrid from "../ui/DetailTileGrid.vue";

const SERVICE_ID = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY as string;

const MAX_MESSAGE = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

/* ── Form state ──────────────────────────────────────────────────────── */

const form = reactive({
  from_name: "",
  from_email: "",
  message: "",
});

const touched = reactive({
  from_name: false,
  from_email: false,
  message: false,
});

const status = ref<"idle" | "sending" | "success" | "error">("idle");
const submitError = ref("");

let successTimer: ReturnType<typeof setTimeout> | null = null;

const feedbackInitial = { opacity: 0, y: 10, scale: 0.985 };
const feedbackVisible = { opacity: 1, y: 0, scale: 1 };
const contactNotes = [
  {
    title: "Best for",
    description:
      "Project inquiries, frontend work, product polish, and collaborations with a clear scope.",
  },
  {
    title: "Reply style",
    description:
      "Short, direct replies first. If the project fits, follow-up moves into details quickly.",
  },
  {
    title: "Useful details",
    description:
      "Timeline, rough scope, and what kind of help you need make the first reply faster.",
  },
] as const;

/* ── Validation ──────────────────────────────────────────────────────── */

const errors = computed(() => ({
  from_name:
    touched.from_name && !form.from_name.trim() ? "Name is required." : "",
  from_email: touched.from_email
    ? !form.from_email.trim()
      ? "Email is required."
      : !EMAIL_RE.test(form.from_email.trim())
        ? "Enter a valid email address."
        : ""
    : "",
  message:
    touched.message && !form.message.trim() ? "Message is required." : "",
}));

const charCount = computed(() => form.message.length);

const hasErrors = computed(
  () =>
    !!(
      errors.value.from_name ||
      errors.value.from_email ||
      errors.value.message
    ),
);

/* ── Handlers ────────────────────────────────────────────────────────── */

function onBlur(field: keyof typeof touched) {
  touched[field] = true;
}

async function submit() {
  touched.from_name = true;
  touched.from_email = true;
  touched.message = true;

  if (hasErrors.value) return;

  status.value = "sending";

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: form.from_name.trim(),
        from_email: form.from_email.trim(),
        message: form.message.trim(),
      },
      { publicKey: PUBLIC_KEY },
    );

    status.value = "success";
    form.from_name = "";
    form.from_email = "";
    form.message = "";
    touched.from_name = false;
    touched.from_email = false;
    touched.message = false;

    successTimer = setTimeout(() => {
      status.value = "idle";
    }, 4000);
  } catch (err) {
    status.value = "error";
    submitError.value =
      err instanceof Error
        ? err.message
        : "Failed to send message. Please try again.";
  }
}

function retry() {
  status.value = "idle";
  submitError.value = "";
}

onUnmounted(() => {
  if (successTimer) clearTimeout(successTimer);
});
</script>

<template>
  <!-- Info card + form card ──────────────────────────────────────────── -->
  <section class="panel-shell grid gap-5 p-6 md:p-8" aria-label="Contact">
    <!-- Two-column: info card + form card -->
    <div
      class="grid gap-5 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] md:items-start"
    >
      <!-- Info card (static) ──────────────────────────────────────── -->
      <aside
        class="panel-shell panel-shell--lg grid gap-5 p-[22px] md:sticky md:top-24"
        aria-label="Contact information"
      >
        <!-- Info blocks -->
        <DetailTileGrid
          :items="[...contactNotes]"
          columns-class="grid-cols-1"
          tile-class="px-4 py-3.5"
        />

        <!-- Topic chips -->
        <div class="flex flex-wrap gap-2.5">
          <span
            class="pill pill--soft min-h-[36px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
            >Frontend systems</span
          >
          <span
            class="pill pill--soft min-h-[36px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
            >UI polish</span
          >
          <span
            class="pill pill--soft min-h-[36px] px-3.5 text-[13px] text-[var(--color-on-surface)]"
            >Portfolio work</span
          >
        </div>
      </aside>

      <!-- Form card ───────────────────────────────────────────────── -->
      <section
        class="panel-shell panel-shell--lg grid gap-5 p-[22px]"
        aria-label="Send a message"
      >
        <!-- Form header -->
        <div class="grid gap-2.5">
          <h2 class="font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-none">
            Send a message
          </h2>
          <p
            class="max-w-[54ch] text-sm text-[var(--color-on-surface-variant)]"
          >
            Fill in the fields below. Validation runs on blur — no interruptions
            while you type.
          </p>
        </div>

        <!-- Snackbar — success ──────────────────────────────────── -->
        <Motion
          v-if="status === 'success'"
          as="div"
          class="flex items-start justify-between gap-4 rounded-[18px] border border-[color-mix(in_srgb,#166534_25%,var(--color-surface))] bg-[color-mix(in_srgb,rgba(22,101,52,0.12)_70%,var(--color-surface))] px-4 py-3.5 text-[#166534] dark:border-[color-mix(in_srgb,#86efac_25%,var(--color-surface))] dark:bg-[color-mix(in_srgb,rgba(134,239,172,0.14)_70%,var(--color-surface))] dark:text-[#86efac]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          :initial="feedbackInitial"
          :animate="feedbackVisible"
          :transition="{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }"
        >
          <div>
            <strong class="block text-[14px] font-semibold"
              >Message sent</strong
            >
            <p class="mt-1 text-[13px]">
              Your note is on the way. This confirmation dismisses
              automatically.
            </p>
          </div>
        </Motion>

        <!-- Snackbar — error ─────────────────────────────────────── -->
        <Motion
          v-if="status === 'error'"
          as="div"
          class="flex items-start justify-between gap-4 rounded-[18px] border border-[color-mix(in_srgb,var(--color-error)_28%,var(--color-surface))] bg-[color-mix(in_srgb,var(--color-error)_10%,var(--color-surface))] px-4 py-3.5 text-[var(--color-error)]"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          :initial="feedbackInitial"
          :animate="feedbackVisible"
          :transition="{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }"
        >
          <div>
            <strong class="block text-[14px] font-semibold"
              >Failed to send</strong
            >
            <p class="mt-1 text-[13px]">{{ submitError }}</p>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 min-h-[34px] items-center rounded-full border border-current px-3.5 text-[13px] font-semibold hover:bg-[color-mix(in_srgb,currentColor_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            @click="retry"
          >
            Retry
          </button>
        </Motion>

        <!-- Form ────────────────────────────────────────────────── -->
        <form class="grid gap-[18px]" novalidate @submit.prevent="submit">
          <!-- Name field -->
          <div class="grid gap-2.5">
            <label
              for="contact-name"
              class="text-[13px] font-semibold text-[var(--color-on-surface)]"
              >Name</label
            >
            <div class="grid gap-2">
              <input
                id="contact-name"
                v-model="form.from_name"
                type="text"
                autocomplete="name"
                inputmode="text"
                placeholder="Your name"
                :aria-invalid="!!errors.from_name || undefined"
                :aria-describedby="
                  errors.from_name ? 'name-error' : 'name-hint'
                "
                class="w-full min-h-[56px] rounded-2xl border border-transparent border-b-[var(--color-outline)] bg-[color-mix(in_srgb,var(--color-surface-variant)_90%,var(--color-surface))] px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[color-mix(in_srgb,var(--color-on-surface-variant)_82%,transparent)] outline-none transition-all duration-150 focus:border-[var(--color-cta)] focus:[box-shadow:inset_0_0_0_1px_var(--color-cta)]"
                :class="
                  errors.from_name
                    ? 'border-b-[var(--color-error)] [box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_42%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_7%,var(--color-surface))]'
                    : ''
                "
                @blur="onBlur('from_name')"
              />
              <p
                v-if="errors.from_name"
                id="name-error"
                class="text-[12px] text-[var(--color-error)]"
              >
                {{ errors.from_name }}
              </p>
              <p
                v-else
                id="name-hint"
                class="text-[12px] text-[var(--color-on-surface-variant)]"
              >
                Use your real name so the reply feels personal.
              </p>
            </div>
          </div>

          <!-- Email field -->
          <div class="grid gap-2.5">
            <label
              for="contact-email"
              class="text-[13px] font-semibold text-[var(--color-on-surface)]"
              >Email</label
            >
            <div class="grid gap-2">
              <input
                id="contact-email"
                v-model="form.from_email"
                type="email"
                autocomplete="email"
                inputmode="email"
                placeholder="you@example.com"
                :aria-invalid="!!errors.from_email || undefined"
                :aria-describedby="
                  errors.from_email ? 'email-error' : undefined
                "
                class="w-full min-h-[56px] rounded-2xl border border-transparent border-b-[var(--color-outline)] bg-[color-mix(in_srgb,var(--color-surface-variant)_90%,var(--color-surface))] px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[color-mix(in_srgb,var(--color-on-surface-variant)_82%,transparent)] outline-none transition-all duration-150 focus:border-[var(--color-cta)] focus:[box-shadow:inset_0_0_0_1px_var(--color-cta)]"
                :class="
                  errors.from_email
                    ? 'border-b-[var(--color-error)] [box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_42%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_7%,var(--color-surface))]'
                    : ''
                "
                @blur="onBlur('from_email')"
              />
              <p
                v-if="errors.from_email"
                id="email-error"
                class="text-[12px] text-[var(--color-error)]"
              >
                {{ errors.from_email }}
              </p>
            </div>
          </div>

          <!-- Message field -->
          <div class="grid gap-2.5">
            <div class="flex items-center justify-between gap-3">
              <label
                for="contact-message"
                class="text-[13px] font-semibold text-[var(--color-on-surface)]"
                >Message</label
              >
              <span
                class="text-[12px] text-[var(--color-on-surface-variant)]"
                aria-live="polite"
                aria-atomic="true"
                >{{ charCount }} / {{ MAX_MESSAGE }}</span
              >
            </div>
            <div class="grid gap-2">
              <textarea
                id="contact-message"
                v-model="form.message"
                rows="6"
                :maxlength="MAX_MESSAGE"
                placeholder="Tell me about the project, timeline, and what you need help with."
                :aria-invalid="!!errors.message || undefined"
                :aria-describedby="errors.message ? 'message-error' : undefined"
                class="w-full min-h-[156px] resize-y rounded-2xl border border-transparent border-b-[var(--color-outline)] bg-[color-mix(in_srgb,var(--color-surface-variant)_90%,var(--color-surface))] px-4 py-3 text-[var(--color-on-surface)] placeholder:text-[color-mix(in_srgb,var(--color-on-surface-variant)_82%,transparent)] outline-none transition-all duration-150 focus:border-[var(--color-cta)] focus:[box-shadow:inset_0_0_0_1px_var(--color-cta)]"
                :class="
                  errors.message
                    ? 'border-b-[var(--color-error)] [box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_42%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_7%,var(--color-surface))]'
                    : ''
                "
                @blur="onBlur('message')"
              />
              <p
                v-if="errors.message"
                id="message-error"
                class="text-[12px] text-[var(--color-error)]"
              >
                {{ errors.message }}
              </p>
            </div>
          </div>

          <!-- Submit row -->
          <div
            class="flex flex-wrap items-center justify-between gap-4 pt-1 sm:flex-nowrap"
          >
            <p
              class="max-w-[38ch] text-[12px] text-[var(--color-on-surface-variant)]"
            >
              Your message will be sent directly. I reply to serious project
              inquiries.
            </p>
            <button
              type="submit"
              :disabled="status === 'sending'"
              class="button-primary w-full gap-2.5 disabled:pointer-events-none disabled:opacity-90 sm:w-auto sm:min-w-[172px]"
              :aria-busy="status === 'sending'"
            >
              <!-- Spinner -->
              <span
                v-if="status === 'sending'"
                class="h-4 w-4 rounded-full border-2 border-white/35 border-t-white animate-spin"
                aria-hidden="true"
              />
              <span>{{
                status === "sending" ? "Sending" : "Send Message"
              }}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>
