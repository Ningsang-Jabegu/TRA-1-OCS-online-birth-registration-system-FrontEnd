import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const Cta = () => (
    <section className="bg-nepal-blue py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Ready to Register a Birth?</h2>
            <p className="text-xl mb-8">
                Join thousands of citizens who have already simplified their birth
                registration process with our digital system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                    <Button className="bg-white/100 text-nepal-blue hover:bg-white/85">
                        Register Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                <Link to="/certificate-verification">
                    <Button
                        variant="transparent"
                        className="bg-white/0 text-white hover:bg-white/30 border border-white/30"
                    >
                        Verify Certificate
                    </Button>
                </Link>
            </div>
        </div>
    </section>
);

export default Cta;