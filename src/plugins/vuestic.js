import { createVuestic, createIconsConfig } from "vuestic-ui";

export const vuestic = createVuestic({
  config: {
    colors: {
      variables: {
        // Default colors
        primary: "#6022C6",
        secondary: "#8960FC",
        complementary: "#e800ac",
        font: "#ffffff",
        bg: "#16151a",
        border: "#222227",
        error: "#dc3545",
        blue: "#0054e8",
        info: "#17a2b8",
        warning: "#ffda6c",
        danger: '#ffcd37',
        success: "#28a745",
        black: "#282828",
      },
    },
    icons: createIconsConfig({
      aliases: [
        {
          name: "mi-warning",
          to: "fa-solid fa-triangle-exclamation",
        },
        {
          name: "mi-chevron_left",
          to: "fa-solid fa-chevron-left"
        },
        {
          name: "mi-chevron_right",
          to: "fa-solid fa-chevron-right"
        },
        {
          name: "mi-calendar_today",
          to: "fa-regular fa-calendar"
        },
        {
          name: "mi-expand_less",
          to: "fa-solid fa-caret-up",
        },
        {
          name: "mi-expand_more",
          to: "fa-solid fa-caret-down",
        },
        {
          name: "mi-check",
          to: "fa-solid fa-check",
        },
        {
          name: "mi-warning",
          to: "fa-solid fa-triangle-exclamation",
        },
        {
          name: "remove",
          to: "fa-solid fa-minus",
        },
        {
          name: "mi-highlight_off",
          to: "fa-solid fa-close"
        },
        {
          name: "mi-loop",
          to: "fa-solid fa-spinner"
        },
        {
          name: "mi-close",
          to: "fa-solid fa-close"
        },
        {
          name: "unfold_more",
          to: "fa-solid fa-sort"
        }
      ],
      fonts: [
        {
          name: "fa-{code}",
          resolve: ({ code }) => ({
            class: "",
            content: "",
            attrs: { icon: `fa-${code}` },
            tag: "fa-icon",
          }),
        },

        {
          name: 'msr-{icon}',
          resolve: ({ icon }) => ({
            class: 'material-symbols-rounded',
            content: icon,
            tag: 'span',
          }),
        }
      ],
    }),
  },
});
