/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "@/components/features/FormattedDate" {
  import type { JSX } from "react";

  function FormattedDate(props: { date: Date }): JSX.Element;
  export default FormattedDate;
}
