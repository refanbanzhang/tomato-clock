/** public/ 资源。生产 base 是 /tomato-clock/，不能从域名根写死。 */
export function asset(file: string): string {
  return `${import.meta.env.BASE_URL}${file.replace(/^\//, "")}`;
}
