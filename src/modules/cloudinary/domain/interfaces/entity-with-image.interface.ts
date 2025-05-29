/**
 * Interface for entities that have an image field
 */
export interface EntityWithImage {
  id: number;
  [imageField: string]: any;
}
