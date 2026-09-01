/**
 * Value object representing a single version change in catalogs.expo.
 */
export class CatalogUpdate {
  constructor(
    readonly name: string,
    readonly from: string,
    readonly to: string,
  ) {}

  static between(name: string, from: string, to: string): CatalogUpdate | null {
    if (!from || !to || from === to) return null;
    return new CatalogUpdate(name, from, to);
  }
}
