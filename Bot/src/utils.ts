import { encodeTelegramUrlParameters, isTelegramUrl } from "@tonconnect/sdk";

export function addTGReturnStrategy(link: string, strategy: string): string {
  const parsed = new URL(link);
  parsed.searchParams.append("ret", strategy);
  link = parsed.toString();

  const lastParam = link.slice(link.lastIndexOf("&") + 1);
  return (
    link.slice(0, link.lastIndexOf("&")) +
    "-" +
    encodeTelegramUrlParameters(lastParam)
  );
}

export function convertDeeplinkToUniversalLink(
  link: string,
  walletUniversalLink: string
): string {
  const search = new URL(link).search;
  const url = new URL(walletUniversalLink);

  if (isTelegramUrl(walletUniversalLink)) {
    const startattach =
      "tonconnect-" + encodeTelegramUrlParameters(search.slice(1));
    url.searchParams.append("startattach", startattach);
  } else {
    url.search = search;
  }

  return url.toString();
}
