import AnimationSpin from "@/shared/animations/spin.animation";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Spinner() {
   return (
      <AnimationSpin>
         <FontAwesomeIcon icon={faCircleNotch} />
      </AnimationSpin>
   )
}