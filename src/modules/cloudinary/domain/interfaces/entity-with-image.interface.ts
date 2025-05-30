/**
 * Interface for entities that have an image field
 */
export interface EntityWithImage {
  id: string;
  [imageField: string]: any;
}
