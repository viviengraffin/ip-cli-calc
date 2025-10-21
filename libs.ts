import {
  ip,
  IPv4Address,
  IPv4Context,
  IPv4Submask,
  IPv6Address,
  IPv6Context,
  IPv6Submask,
} from "@viviengraffin/ip-context";

import denoJson from "./deno.json" with { type: "json" };
import {
  MAX_IPV4_ADDRESS_LENGTH,
  MAX_IPv6_ADDRESS_LENGTH,
  MAX_LABEL_LENGTH,
} from "./const.ts";

function getHostsString(hostsString: string): string {
  return hostsString.substring(8);
}

export function createContextFromArgs(
  args: string[],
): IPv4Context | IPv6Context {
  let sAddress: string;
  let cidr: number | null = null;
  let sSubmask: string | null = null;
  let sHosts: string | null = null;
  let hosts: number | bigint | null = null;

  if (args.length === 0) {
    throw new Error("Arguments missing");
  }

  if (args.length === 1) {
    const slashPos = args[0].indexOf("/");
    if (slashPos !== -1) {
      sAddress = args[0].substring(0, slashPos);
      cidr = Number(args[0].substring(slashPos + 1));
    } else {
      sAddress = args[0];
    }
  }
  if (args.length === 2) {
    if (args[0].startsWith("--hosts=")) {
      sAddress = args[1];
      sHosts = getHostsString(args[0]);
    } else {
      sAddress = args[0];
    }
  }

  const address = ip(sAddress!);

  if (sHosts !== null) {
    if (address instanceof IPv4Address) {
      hosts = Number(sHosts);
    } else {
      hosts = BigInt(sHosts);
    }
  } else if (args.length === 2) {
    sAddress = args[0];
    if (args[1].startsWith("--hosts=")) {
      if (cidr !== null) {
        throw new Error("Cidr already defined");
      }
      if (address instanceof IPv4Address) {
        hosts = Number(args[1].substring(8));
      } else {
        hosts = BigInt(args[1].substring(8));
      }
    } else {
      sSubmask = args[1];
    }
  }

  let context: IPv4Context | IPv6Context;
  if (hosts) {
    // deno-lint-ignore ban-ts-comment
    // @ts-expect-error
    context = address.createContextWithHosts(hosts);
  } else if (cidr !== null) {
    context = address.createContextWithSubmask(cidr);
  } else if (sSubmask) {
    context = address.createContextWithSubmask(sSubmask);
  } else if (address instanceof IPv4Address) {
    const rContext = address.createContextFromClass();
    if (rContext === null) {
      throw new Error("This IPv4 Address has not defined submask");
    }
    context = rContext;
  } else {
    throw new Error("Submask not defined");
  }

  return context;
}

export function displayIPv4Context(
  context: IPv4Context,
  binary: boolean,
): void {
  const wildcard = getWildcardAddress(context.submask);
  const type = context.address.getType();
  console.log(
    "Address:".padEnd(MAX_LABEL_LENGTH, " ") +
      context.address.toString().padEnd(MAX_IPV4_ADDRESS_LENGTH, " ") +
      (binary ? context.address.toBinarySeparatedString() : ""),
  );
  console.log(
    "Netmask:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.submask.toString() + " = " + context.cidr).padEnd(
        MAX_IPV4_ADDRESS_LENGTH,
        " ",
      ) + (binary ? context.submask.toBinarySeparatedString() : ""),
  );
  console.log(
    "Wildcard:".padEnd(MAX_LABEL_LENGTH, " ") +
      wildcard.toString().padEnd(MAX_IPV4_ADDRESS_LENGTH, " ") +
      (binary ? wildcard.toBinarySeparatedString() : ""),
  );
  console.log("=>");
  console.log(
    "Network:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.network.toString() + "/" + context.cidr).padEnd(
        MAX_IPV4_ADDRESS_LENGTH,
        " ",
      ) + (binary ? context.network.toBinarySeparatedString() : ""),
  );
  console.log(
    "Broadcast:".padEnd(MAX_LABEL_LENGTH, " ") +
      context.broadcast.toString().padEnd(MAX_IPV4_ADDRESS_LENGTH, " ") +
      (binary ? context.broadcast.toBinarySeparatedString() : ""),
  );
  console.log(
    "HostMin:".padEnd(MAX_LABEL_LENGTH, " ") +
      context.firstHost.toString().padEnd(MAX_IPV4_ADDRESS_LENGTH, " ") +
      (binary ? context.firstHost.toBinarySeparatedString() : ""),
  );
  console.log(
    "HostMax:".padEnd(MAX_LABEL_LENGTH, " ") +
      context.lastHost.toString().padEnd(MAX_IPV4_ADDRESS_LENGTH, " ") +
      (binary ? context.lastHost.toBinarySeparatedString() : ""),
  );
  console.log(
    "Hosts/Size/Net:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.hosts + "/" + context.size).padEnd(
        MAX_IPV4_ADDRESS_LENGTH,
        " ",
      ) + "Class " +
      context.class + (
        type === null ? "" : ", " + type
      ),
  );
}

export function displayIPv6Context(
  context: IPv6Context,
  binary: boolean,
): void {
  const type = context.address.getType();
  console.log(
    "Address:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.address.toString()).padEnd(MAX_IPv6_ADDRESS_LENGTH, " ") +
      (binary ? context.address.toBinarySeparatedString() : ""),
  );
  console.log(
    "Submask:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.submask.toString() + " = " + context.cidr).padEnd(
        MAX_IPv6_ADDRESS_LENGTH,
        " ",
      ) + (binary ? context.submask.toBinarySeparatedString() : ""),
  );
  console.log("=>");
  console.log(
    "Network:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.network.toString() + "/" + context.cidr).padEnd(
        MAX_IPv6_ADDRESS_LENGTH,
        " ",
      ) + (binary ? context.network.toBinarySeparatedString() : ""),
  );
  console.log(
    "HostMin:".padEnd(MAX_LABEL_LENGTH, " ") +
      context.firstHost.toString().padEnd(MAX_IPv6_ADDRESS_LENGTH, " ") +
      (binary ? context.firstHost.toBinarySeparatedString() : ""),
  );
  console.log(
    "HostMax:".padEnd(MAX_LABEL_LENGTH, " ") +
      context.lastHost.toString().padEnd(MAX_IPv6_ADDRESS_LENGTH, " ") +
      (binary ? context.lastHost.toBinarySeparatedString() : ""),
  );
  console.log(
    "Hosts/Size/Net:".padEnd(MAX_LABEL_LENGTH, " ") +
      (context.hosts + "/" + context.size).padEnd(
        MAX_IPv6_ADDRESS_LENGTH,
        " ",
      ) +
      (
        type === null ? "" : type
      ),
  );
}

export function displayIPv4ContextJSON(context: IPv4Context): void {
  console.log(JSON.stringify({
    address: context.address.toString(),
    submask: {
      string: context.submask.toString(),
      cidr: context.cidr,
    },
    networkAddress: context.network.toString(),
    broadcastAddress: context.broadcast.toString(),
    firstHost: context.firstHost.toString(),
    lastHost: context.lastHost.toString(),
    size: context.size,
    hosts: context.hosts,
    class: context.class,
    type: context.address.getType(),
  }));
}

export function displayIPv6ContextJSON(context: IPv6Context): void {
  console.log(JSON.stringify({
    address: context.address.toString(),
    submask: {
      string: context.submask.toString(),
      cidr: context.cidr,
    },
    networkAddress: context.network.toString(),
    firstHost: context.firstHost.toString(),
    lastHost: context.lastHost.toString(),
    size: context.size,
    hosts: context.hosts,
    type: context.address.getType(),
  }, (_, value) => typeof value === "bigint" ? value.toString() : value));
}

export function displayVersion() {
  console.log("ip-cli-calc v" + denoJson.version);
}

type GetWildcardAddressReturns<T extends IPv4Submask | IPv6Submask> = T extends
  IPv4Submask ? IPv4Address : IPv6Address;

function getWildcardAddress<T extends IPv4Submask | IPv6Submask>(
  submask: T,
): GetWildcardAddressReturns<T> {
  const newArray = submask instanceof IPv4Submask
    ? new Uint8Array(4)
    : new Uint16Array(8);

  for (let i = 0; i < submask.array.length; i++) {
    newArray[i] = ~submask.array[i];
  }

  return submask instanceof IPv4Submask
    ? new IPv4Address(newArray as Uint8Array, {
      check: false,
    }) as GetWildcardAddressReturns<T>
    : new IPv6Address(newArray as Uint16Array, {
      check: false,
    }) as GetWildcardAddressReturns<T>;
}
