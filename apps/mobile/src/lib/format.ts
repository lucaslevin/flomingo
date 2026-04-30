import { differenceInDays, differenceInHours, differenceInMinutes, differenceInMonths, differenceInYears } from "date-fns";

export function formatTimeAgo(timestamp: number): string {
	const diffMinutes = differenceInMinutes(Date.now(), timestamp);
	const diffHours = differenceInHours(Date.now(), timestamp);
	const diffDays = differenceInDays(Date.now(), timestamp);
	const diffMonths = differenceInMonths(Date.now(), timestamp);
	const diffYears = differenceInYears(Date.now(), timestamp);

	if (diffMinutes < 1) return "now";
	if (diffMinutes < 60) return `${diffMinutes}m`;
	if (diffHours < 24) return `${diffHours}h`;
	if (diffDays < 30) return `${diffDays}d`;
	if (diffMonths < 12) return `${diffMonths}mo`;
	return `${diffYears}y`;
}
