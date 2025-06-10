import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { servicesData } from "../../db/LocalDataBase";

const ServicesSection: React.FC = () => (
    <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {servicesData.map((service) => (
                    <div
                        key={service.title}
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                    >
                        <div className={`h-12 w-12 ${service.iconBg} rounded-full flex items-center justify-center mb-4`}>
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        <Link
                            to={service.link}
                            className="text-nepal-blue font-medium hover:underline inline-flex items-center"
                        >
                            {service.linkText}
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default ServicesSection;