export function computeAttendance(timeIn, timeOut, schedule) {
    const inMin = timeIn.getHours() * 60 + timeIn.getMinutes();
    const outMin = timeOut.getHours() * 60 + timeOut.getMinutes();
    const shiftStart = Number(schedule.start.split(":")[0]) * 60 +
        Number(schedule.start.split(":")[1]);
    const shiftEnd = Number(schedule.end.split(":")[0]) * 60 +
        Number(schedule.end.split(":")[1]);
    const late = Math.max(0, inMin - shiftStart);
    const undertime = Math.max(0, shiftEnd - outMin);
    const overtime = Math.max(0, outMin - shiftEnd);
    const regularStart = Math.max(inMin, shiftStart);
    const regularEnd = Math.min(outMin, shiftEnd);
    const regularMinutes = regularEnd > regularStart ? regularEnd - regularStart : 0;
    const totalMinutes = Math.max(0, outMin - inMin);
    return {
        late,
        undertime,
        overtime,
        regularHours: Number((regularMinutes / 60).toFixed(2)),
        totalHours: Number((totalMinutes / 60).toFixed(2)),
    };
}
//# sourceMappingURL=calculation.js.map