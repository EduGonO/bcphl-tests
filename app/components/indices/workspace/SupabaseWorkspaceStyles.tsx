import React from "react";

const SupabaseWorkspaceStyles: React.FC = () => (
  <style jsx global>{`
        .supabase-panel {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }
        .supabase-panel__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }
        .supabase-panel__left {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .supabase-panel__right {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .supabase-panel__mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px;
          border-radius: 999px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: #f4f5fb;
        }
        .supabase-panel__mode-btn {
          border: none;
          background: transparent;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #5a5c62;
          cursor: pointer;
        }
        .supabase-panel__mode-btn--active {
          color: #1f2024;
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(18, 19, 27, 0.1);
        }
        .supabase-panel__session {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.6);
          box-shadow: 0 10px 24px rgba(18, 19, 27, 0.08);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .supabase-panel__session-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .supabase-panel__session-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b6e76;
        }
        .supabase-panel__session-email {
          font-size: 12px;
          font-weight: 600;
          color: #1c1e24;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .supabase-panel__signout {
          border: none;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          background: #1f2024;
          color: #ffffff;
          cursor: pointer;
        }
        .supabase-panel__signout:hover {
          background: #292a30;
        }
        .supabase-panel__subtitle {
          margin: 0;
          font-size: 13px;
          color: #5a5c62;
        }
        .supabase-panel__actions {
          display: flex;
          gap: 8px;
        }
        .supabase-panel__error {
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(162, 47, 33, 0.08);
          color: #a62f21;
          font-size: 13px;
          flex-shrink: 0;
        }
        .supabase-intros {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: #f9fafc;
        }
        .supabase-intros__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .supabase-intros__title {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #444651;
        }
        .supabase-intros__subtitle {
          margin: 4px 0 0;
          color: #6f717a;
          font-size: 12px;
        }
        .supabase-intros__actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .supabase-intros__body {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          gap: 14px;
        }
        .supabase-intros__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .supabase-intros__editor {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .supabase-intros__empty {
          margin: 0;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px dashed rgba(0, 0, 0, 0.16);
          color: #7a7c82;
          font-size: 12px;
        }
        .supabase-intro-card {
          text-align: left;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 10px 12px;
          background: #ffffff;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .supabase-intro-card:hover {
          border-color: rgba(0, 0, 0, 0.14);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }
        .supabase-intro-card--active {
          border-color: rgba(36, 119, 70, 0.28);
          box-shadow: inset 0 0 0 1px rgba(36, 119, 70, 0.28);
        }
        .supabase-intro-card__title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2024;
        }
        .supabase-intro-card__slug {
          font-size: 11px;
          color: #7a7c82;
        }
        .supabase-intro-card__meta {
          font-size: 11px;
          color: #5f6169;
        }
        .supabase-button {
          border: none;
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          cursor: pointer;
          background: #1f1f22;
          color: #ffffff;
        }
        .supabase-button--ghost {
          background: transparent;
          border: 1px solid rgba(0, 0, 0, 0.12);
          color: #1f1f22;
        }
        .supabase-button--primary {
          background: #2b7a4a;
        }
        .supabase-button--danger {
          background: #a62f21;
        }
        .supabase-button--icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          letter-spacing: 0;
          text-transform: none;
          line-height: 1;
        }
        .supabase-button--icon.is-spinning {
          animation: supabase-spin 0.9s linear infinite;
        }
        @keyframes supabase-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .supabase-create {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 16px;
          background: #f9fafb;
          flex-shrink: 0;
        }
        .supabase-create__row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .supabase-create__row label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #71737b;
        }
        .supabase-create__row input[type="text"],
        .supabase-create__row input[type="checkbox"],
        .supabase-create__row input[type="date"],
        .supabase-create__row input[type="datetime-local"],
        .supabase-create__row input[type="time"] {
          font-family: inherit;
        }
        .supabase-create__row input[type="text"],
        .supabase-create__row input[type="date"],
        .supabase-create__row input[type="datetime-local"],
        .supabase-create__row input[type="time"] {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #ffffff;
          font-size: 13px;
        }
        .supabase-create__status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 0;
          text-transform: none;
        }
        .supabase-create__categories {
          margin: 0;
          border: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .supabase-create__categories legend {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #71737b;
        }
        .supabase-create__categories-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .supabase-create__categories-grid label {
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
        }
        .supabase-create__categories-grid label.active {
          border-color: rgba(36, 119, 70, 0.32);
          background: rgba(36, 119, 70, 0.08);
        }
        .supabase-create__error {
          margin: 0;
          color: #a62f21;
          font-size: 12px;
        }
        .supabase-workspace {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: 12px;
          overflow: hidden;
        }
        .supabase-workspace--admin {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: minmax(0, 300px) minmax(0, 1fr);
          gap: 10px;
        }
        .supabase-workspace--bios {
          grid-template-columns: minmax(0, 1fr);
        }
        .supabase-workspace__sidebar {
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 8px;
        }
        .supabase-workspace__table {
          min-height: 0;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 20px;
          background: linear-gradient(150deg, #ffffff 0%, #f4f5fb 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .supabase-table__scroll {
          flex: 1;
          min-height: 0;
          overflow: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .supabase-workspace__sidebar::-webkit-scrollbar,
        .supabase-workspace__editor::-webkit-scrollbar,
        .supabase-table__scroll::-webkit-scrollbar,
        .supabase-rich-text .ql-container::-webkit-scrollbar,
        .supabase-rich-text .ql-editor::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .supabase-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          line-height: 1.4;
        }
        .supabase-table th {
          position: sticky;
          top: 0;
          background: rgba(246, 247, 251, 0.92);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          text-align: left;
          padding: 12px 18px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #6a6c72;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          z-index: 1;
        }
        .supabase-table td {
          padding: 14px 18px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          vertical-align: top;
          color: #1f2024;
        }
        .supabase-table tr:last-of-type td {
          border-bottom: none;
        }
        .supabase-table__row {
          cursor: pointer;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
        }
        .supabase-table__row:hover {
          background: rgba(32, 40, 86, 0.06);
        }
        .supabase-table__row:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 2px rgba(48, 82, 196, 0.32);
        }
        .supabase-table__row--active {
          background: rgba(36, 119, 70, 0.12);
          box-shadow: inset 0 0 0 1px rgba(36, 119, 70, 0.32);
        }
        .supabase-table__title {
          font-size: 13px;
          font-weight: 600;
        }
        .supabase-table__slug {
          margin-top: 2px;
          font-size: 11px;
          color: #7a7c82;
        }
        .supabase-table__categories {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .supabase-table__category {
          padding: 2px 10px;
          border-radius: 999px;
          background: rgba(24, 27, 44, 0.08);
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #45474f;
        }
        .supabase-table__category--empty {
          background: transparent;
          border: 1px dashed rgba(0, 0, 0, 0.18);
          color: #7a7c82;
        }
        .supabase-table__status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 96px;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .supabase-table__status--published {
          background: rgba(36, 119, 70, 0.12);
          color: #2b7a4a;
          border: 1px solid rgba(36, 119, 70, 0.28);
        }
        .supabase-table__status--draft {
          background: rgba(139, 97, 23, 0.12);
          color: #9a6118;
          border: 1px solid rgba(139, 97, 23, 0.26);
        }
        .supabase-table__author {
          font-weight: 500;
        }
        .supabase-table__muted {
          color: #a0a2a8;
        }
        .supabase-table__empty td {
          text-align: center;
          padding: 26px 18px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #7a7c82;
        }
        .supabase-category__header {
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 10px;
          color: #7a7c82;
        }
        .supabase-category__dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .supabase-category__list {
          list-style: none;
          margin: 8px 0 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-category__empty {
          font-size: 12px;
          color: #7a7c82;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px dashed rgba(0, 0, 0, 0.08);
        }
        .supabase-entry {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .supabase-entry:hover {
          border-color: rgba(0, 0, 0, 0.18);
          box-shadow: 0 8px 20px rgba(17, 17, 23, 0.08);
        }
        .supabase-entry--active {
          border-color: rgba(36, 119, 70, 0.32);
          box-shadow: inset 0 0 0 1px rgba(36, 119, 70, 0.2);
        }
        .supabase-entry__title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2024;
        }
        .supabase-entry__preview {
          font-size: 11px;
          color: #666971;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 100%;
        }
        .supabase-entry__dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }
        .supabase-entry__dot--published {
          background: #34d27a;
        }
        .supabase-entry__dot--draft {
          background: #ffae42;
        }
        .supabase-workspace__editor {
          flex: 1;
          min-height: 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 12px;
          background: linear-gradient(140deg, #ffffff 0%, #f4f5fb 100%);
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .supabase-workspace__empty {
          margin: auto;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #7a7c82;
          border: 1px dashed rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 40px 24px;
          background: #fafbff;
        }
        .supabase-editor__status {
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #f6f7fb;
          color: #4c4f58;
          flex-shrink: 0;
        }
        .supabase-editor__status--dirty {
          border-color: rgba(168, 68, 52, 0.32);
          background: rgba(168, 68, 52, 0.12);
          color: #a64534;
        }
        .supabase-editor__status--loading {
          border-color: rgba(156, 132, 35, 0.32);
          background: rgba(156, 132, 35, 0.12);
          color: #8a7120;
        }
        .supabase-editor__status--saving {
          border-color: rgba(36, 119, 70, 0.32);
          background: rgba(36, 119, 70, 0.12);
          color: #2b7a4a;
        }
        .supabase-editor__status--saved {
          border-color: rgba(36, 119, 70, 0.28);
          background: rgba(36, 119, 70, 0.08);
          color: #2b7a4a;
        }
        .supabase-editor__status--error {
          border-color: rgba(162, 47, 33, 0.32);
          background: rgba(162, 47, 33, 0.12);
          color: #a62f21;
        }
        .supabase-editor__content {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-height: 0;
          overflow: visible;
          padding-right: 2px;
        }
        .supabase-editor__top,
        .supabase-editor__canvas {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .supabase-editor__top {
          border-radius: 14px 14px 10px 10px;
        }
        .supabase-editor__canvas {
          flex: 0 0 auto;
          min-height: 520px;
          border-radius: 10px 10px 14px 14px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6), 0 8px 18px rgba(17, 18, 31, 0.04);
          overflow: hidden;
        }
        .supabase-editor__canvas .supabase-rich-text {
          flex: 1;
          min-height: 0;
          height: 460px;
        }
        .supabase-editor__primary-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .supabase-editor__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #6f717a;
          flex: 1 1 200px;
        }
        .supabase-editor__field span,
        .supabase-editor__field legend {
          font-size: inherit;
          letter-spacing: inherit;
          text-transform: inherit;
          color: inherit;
        }
        .supabase-editor__field legend {
          padding: 0;
        }
        .supabase-editor__field input,
        .supabase-editor__field textarea,
        .supabase-editor__field select {
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #f9f9fd;
          font-size: 13px;
          color: #1f2024;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .supabase-editor__field input:focus,
        .supabase-editor__field textarea:focus,
        .supabase-editor__field select:focus {
          outline: none;
          border-color: rgba(36, 119, 70, 0.4);
          background: #ffffff;
        }
        .supabase-editor__field--compact {
          flex: 0 1 220px;
        }
        .supabase-editor__field--excerpt textarea {
          min-height: 68px;
          max-height: 90px;
        }
        .supabase-editor__field--bio-main textarea {
          min-height: 320px;
        }
        .supabase-editor__field--rank {
          flex: 0 0 88px;
          max-width: 88px;
        }
        .supabase-editor__field--title {
          flex-basis: 100%;
        }
        .supabase-editor__field--title input {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .supabase-editor__field--categories {
          border: none;
          padding: 0;
          margin: 0;
          min-width: 0;
        }
        .supabase-editor__field--categories .supabase-editor__categories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          overflow: visible;
          padding-bottom: 2px;
        }
        .supabase-editor__categories label {
          border: 1px solid rgba(0, 0, 0, 0.14);
          border-radius: 999px;
          padding: 4px 9px;
          font-size: 10px;
          text-transform: none;
          letter-spacing: 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          transition: border-color 0.2s ease, background 0.2s ease;
          white-space: nowrap;
          flex: 0 0 auto;
        }
        .supabase-editor__categories label.active {
          border-color: rgba(36, 119, 70, 0.34);
          background: rgba(36, 119, 70, 0.1);
        }
        .supabase-editor__categories input {
          appearance: none;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: 1px solid rgba(31, 32, 36, 0.42);
          display: inline-block;
          position: relative;
          margin: 0;
          background: #fff;
        }
        .supabase-editor__categories input:checked {
          border-color: #2b7a4a;
          background: #2b7a4a;
        }
        .supabase-editor__categories input:checked::after {
          content: "";
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #fff;
          top: 3px;
          left: 3px;
        }
        .supabase-editor__canvas .supabase-editor__richtext-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: 8px;
        }
        .supabase-editor__richtext-header span:first-of-type {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #2a2c34;
        }
        .supabase-rich-text {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        .supabase-rich-text .ql-toolbar {
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        .supabase-rich-text .ql-container {
          border: none;
          scrollbar-width: none;
          -ms-overflow-style: none;
          font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          flex: 1;
          min-height: 0;
          height: 100%;
          overflow-y: auto;
        }
        .supabase-rich-text .ql-editor {
          line-height: 1.35;
          scrollbar-width: none;
          -ms-overflow-style: none;
          min-height: 100%;
          height: 100%;
          overflow-y: auto;
        }
        .supabase-rich-text .ql-editor img {
          display: block;
          margin: 1.6em auto 0.3em;
        }
        .supabase-rich-text .ql-editor h6 {
          font-size: 12px;
          line-height: 1.6;
          text-align: center;
          margin: 0.15em 0 1em;
        }
        .supabase-rich-text .ql-picker.ql-header
          .ql-picker-label[data-value="6"]::before,
        .supabase-rich-text .ql-picker.ql-header
          .ql-picker-item[data-value="6"]::before {
          content: "légende";
        }
        .supabase-rich-text__loading {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #5a5c62;
        }
        .supabase-editor__details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }
        .supabase-editor__details-grid--identity {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .supabase-editor__details-grid--taxonomy {
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
        }
        .supabase-editor__details-grid--dates {
          grid-template-columns: repeat(2, minmax(200px, 1fr));
        }
        .supabase-editor__details-grid--wide {
          grid-template-columns: minmax(0, 1fr);
        }
        .supabase-editor__details-grid--compact {
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        }
        .supabase-editor__stack {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-editor__stack > * {
          margin: 0;
        }
        .supabase-editor__stack .supabase-editor__field {
          flex: 0 0 auto;
        }
        .supabase-editor__header-image-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .supabase-editor__header-image-controls input[type="text"],
        .supabase-editor__header-image-controls input:not([type]) {
          flex: 1;
        }
        .supabase-editor__file-input {
          display: none;
        }
        .supabase-editor__header-image-thumb {
          margin-top: 4px;
          display: inline-flex;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.14);
          background: #ffffff;
        }
        .supabase-editor__header-image-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .supabase-editor__field textarea {
          min-height: 120px;
          resize: vertical;
        }
        .supabase-editor__textarea {
          min-height: 160px;
          font-family: "IBM Plex Mono", "SFMono-Regular", Menlo, monospace;
        }
        .supabase-editor__field--checkbox {
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 11px;
          text-transform: none;
          letter-spacing: 0.03em;
          color: #2a2c34;
        }
        .supabase-editor__field--status {
          flex: 0 0 auto;
          min-width: fit-content;
          padding: 8px 10px;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          background: #f9f9fd;
          align-self: end;
        }
        .supabase-editor__field--checkbox input {
          width: 18px;
          height: 18px;
        }
        .supabase-editor__advanced {
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 14px;
          padding: 14px;
          background: #f9f9fd;
        }
        .supabase-editor__advanced summary {
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .supabase-editor__advanced[open] {
          background: #f3f4fa;
        }
        .supabase-editor__advanced .supabase-editor__field {
          margin-top: 12px;
        }
        .supabase-editor__media h4 {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5a5c62;
        }
        .supabase-editor__media {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .supabase-editor__media ul {
          margin: 4px 0 0;
          padding-left: 16px;
          color: #5a5c62;
          font-size: 12px;
        }
        .supabase-editor__media code {
          background: rgba(0, 0, 0, 0.04);
          padding: 2px 6px;
          border-radius: 6px;
        }
        .supabase-editor__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 11px;
          color: #7a7c82;
        }
        .supabase-editor__footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
          padding: 10px 2px 2px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          background: transparent;
          position: static;
        }
        .supabase-panel--writer .supabase-workspace__editor {
          background: linear-gradient(145deg, #ffffff 0%, #eef0fa 100%);
        }
        .supabase-panel--writer .supabase-editor__field {
          font-size: 9px;
          letter-spacing: 0.18em;
        }
        .supabase-panel--writer .supabase-editor__field--title input {
          font-size: 20px;
        }
        .supabase-panel--writer .supabase-editor__richtext-header span:first-of-type {
          font-size: 13px;
        }
        @media (max-width: 900px) {
          .supabase-editor__details-grid,
          .supabase-editor__details-grid--identity,
          .supabase-editor__details-grid--taxonomy,
          .supabase-editor__details-grid--dates {
            grid-template-columns: minmax(0, 1fr);
          }
          .supabase-editor__field--status {
            justify-content: flex-start;
            width: fit-content;
          }
          .supabase-intros__body {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 720px) {
          .supabase-workspace {
            grid-template-columns: minmax(0, 1fr);
            grid-template-rows: minmax(0, 220px) minmax(0, 1fr);
          }
          .supabase-workspace__sidebar {
            padding-right: 0;
          }

          .supabase-panel__header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .supabase-panel__actions {
            flex-wrap: wrap;
          }
          .supabase-create__row {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }
        }
      `}</style>
);

export default SupabaseWorkspaceStyles;
