// Shared fSpider namespace object. Each game module imports and augments this
// single instance, replacing the former `var fSpider = fSpider || {}` global
// that the classic-script build relied on.
export const fSpider = {};
