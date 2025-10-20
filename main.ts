import { IPv4Context } from "@viviengraffin/ip-context";
import helpText from "./help.txt" with { type: "text" };
import {
  createContextFromArgs,
  displayIPv4Context,
  displayIPv4ContextJSON,
  displayIPv6Context,
  displayIPv6ContextJSON,
  displayVersion,
} from "./libs.ts";

if (Deno.args.includes("-v") || Deno.args.includes("--version")) {
  displayVersion();
  Deno.exit();
}

if (Deno.args.includes("-h") || Deno.args.includes("--help")) {
  console.log(helpText);
  Deno.exit();
}

const json = Deno.args.includes("-j") || Deno.args.includes("--json");

const context = createContextFromArgs(
  Deno.args.filter((arg) =>
    arg !== "ip-cli-calc" && arg !== "-j" && arg !== "--json" && arg !== "-v" &&
    arg !== "--version" && arg !== "-b" && arg !== "--no-binary" &&
    arg !== "-h" && arg !== "--help"
  ),
);

if (json) {
  if (context instanceof IPv4Context) {
    displayIPv4ContextJSON(context);
  } else {
    displayIPv6ContextJSON(context);
  }
} else {
  const binary =
    !(Deno.args.includes("-b") || Deno.args.includes("--no-binary"));

  if (context instanceof IPv4Context) {
    displayIPv4Context(context, binary);
  } else {
    displayIPv6Context(context, binary);
  }
}
