import Logger from './Logger';

class LogManager {
    listeners: any[];

    constructor() {
        this.listeners = [];
    }

    addListener(listener: any) {
        this.listeners = [...this.listeners, listener];
    }

    createLogger(options: any) {
        return new Logger(options);
    }

    reportLog(logReport: any) {
        this.listeners.forEach((listener) => {
            listener.reportLog(logReport);
        });
    }

    destroy() {
        this.listeners = [];
    }
}

export default LogManager;
