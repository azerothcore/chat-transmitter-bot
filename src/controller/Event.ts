export interface IEvent {
	eventName: string;
	methodName: string;
}

export const Event = (name: string): MethodDecorator => {
	return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
		if (!Reflect.hasMetadata("events", target.constructor)) {
			Reflect.defineMetadata("events", [], target.constructor);
		}

		// Get the events stored so far, extend it by the new one and re-set the metadata.
		const events = Reflect.getMetadata("events", target.constructor) as IEvent[];
		events.push({
			eventName: name,
			methodName: propertyKey,
		});
		Reflect.defineMetadata("events", events, target.constructor);
		return descriptor;
	};
};
