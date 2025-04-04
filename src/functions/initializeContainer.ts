import { singleton, dependencies } from "../types/symbols";
import { autowireService } from "./autowireService";
import { inject } from "./inject";
import { serviceRegistry } from "./serviceRegistry";

// Function to initialize the container and resolve all registered services
export function initializeContainer(): void {
  // First process all class-based services
  serviceRegistry().forEach((service, token) => {
    // Skip value dependencies
    if (service.isValue) return;

    // Ensure all services are initialized
    if (!service[singleton]) {
      // Autowire if needed
      if (!service[dependencies]) {
        autowireService(service);
      }
      inject(service);
    }
  });
}